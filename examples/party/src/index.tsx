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

export type UserStatusType = { username: string; position: number[] }

const getUserBySub = async (DB: D1Database, userSub: string) => {
        return await drizzle(DB)
                .select()
                .from(users)
                .where(eq(users.id, userSub))
                .limit(1)
                .then((r) => r[0])
}
const googleOAuthMiddleware = () => {
        return initAuthConfig((c) => ({
                adapter: DrizzleAdapter(drizzle(c.env.DB)),
                providers: [Google({ clientId: c.env.GOOGLE_ID, clientSecret: c.env.GOOGLE_SECRET })],
                secret: c.env.AUTH_SECRET,
                session: { strategy: 'jwt' },
        }))
}

const bridgeAuth = () => {
        return createMiddleware(async (c, next) => {
                const sub = c.get('authUser').token?.sub
                if (!sub) return
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

const app = new Hono<{ Bindings: Env }>()
        .use('*', googleOAuthMiddleware())
        .use('/api/auth/*', authHandler())
        .use('/parties/*', verifyAuth())
        .use('/parties/*', bridgeAuth())

type Conn = Connection<{ sub: string; username: string }>

export class PartyServer extends Server<Env> {
        static options = { hibernate: true }
        users = new Map<string, UserStatusType>()
        async onConnect(conn: Conn, c: ConnectionContext) {
                const sub = c.request.headers.get('x-auth-sub')
                if (!sub) return
                const user = await getUserBySub(this.env.DB, sub)
                conn.setState({ sub, username: user.name ?? 'Anonymous' })
        }
        async onMessage(conn: Conn, message: string) {
                const { sub, username } = conn.state!
                if (!this.users.has(sub)) {
                        this.users.set(sub, { username, position: [0, 0] })
                }
                this.users.get(sub)!.position = JSON.parse(message).position
                this.broadcast(JSON.stringify([...this.users.values()]))
        }
        onClose(conn: Conn) {
                const { sub } = conn.state!
                this.users.delete(sub)
                this.broadcast(JSON.stringify([...this.users.values()]))
        }
}

export type AppType = typeof app

export default app
