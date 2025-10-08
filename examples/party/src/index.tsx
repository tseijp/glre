import Google from '@auth/core/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import { partyserverMiddleware } from 'hono-party'
import { Server } from 'partyserver'
import { users } from './schema'
import type { Connection, ConnectionContext } from 'partyserver'

const googleOAuthMiddleware = () => {
        return initAuthConfig((c) => {
                return {
                        adapter: DrizzleAdapter(drizzle(c.env.DB)),
                        secret: c.env.AUTH_SECRET,
                        providers: [Google({ clientId: c.env.GOOGLE_ID, clientSecret: c.env.GOOGLE_SECRET })],
                        session: { strategy: 'jwt' },
                }
        })
}

const bridgeAuth = () => {
        return createMiddleware(async (c, next) => {
                const auth = c.get('authUser')
                const sub = auth.token?.sub
                if (!sub) return c.text('Unauthorized', 401)
                return partyserverMiddleware({
                        options: {
                                onBeforeConnect(req) {
                                        req.headers.set('x-auth-sub', sub)
                                        return req
                                },
                        },
                })(c, next)
        })
}

type Env = { DB: D1Database; R2: R2Bucket }

const getUserBySub = async (DB: D1Database, userSub: string) => {
        return await drizzle(DB)
                .select()
                .from(users)
                .where(eq(users.id, userSub))
                .limit(1)
                .then((r) => r[0])
}

export class PartyServer extends Server<Env> {
        static options = { hibernate: true }
        users = {} as Record<string, string>
        async onConnect({ id }: Connection, c: ConnectionContext) {
                const sub = c.request.headers.get('x-auth-sub')
                if (!sub) return
                const user = await getUserBySub(this.env.DB, sub)
                this.users[id] = user.name ?? 'Anonymous'
                console.log(this.users)
                this.broadcast(JSON.stringify(this.users))
        }
        onClose({ id }: Connection) {
                delete this.users[id]
                console.log(this.users)
                this.broadcast(JSON.stringify(this.users), [id])
        }
}

const app = new Hono<{ Bindings: Env }>()
        .use('*', googleOAuthMiddleware())
        .use('/api/auth/*', authHandler())
        .use('/parties/*', verifyAuth())
        .use('/parties/*', bridgeAuth())

export type AppType = typeof app

export default app
