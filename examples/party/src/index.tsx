// index.tsx
import Google from '@auth/core/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { createMiddleware } from 'hono/factory'
import { routePartykitRequest, Server } from 'partyserver'
import { users } from './schema'
import type { Connection, ConnectionContext } from 'partyserver'

const getUserBySub = (DB: D1Database, sub: string) => drizzle(DB).select().from(users).where(eq(users.id, sub)).limit(1)

const googleOAuthMiddleware = initAuthConfig((c) => ({
        adapter: DrizzleAdapter(drizzle(c.env.DB)),
        providers: [Google({ clientId: c.env.GOOGLE_ID, clientSecret: c.env.GOOGLE_SECRET })],
        secret: c.env.AUTH_SECRET,
        session: { strategy: 'jwt' },
}))

export const myMiddleware = createMiddleware(async (c) => {
        const headers = new Headers(c.req.raw.headers)
        headers.set('x-auth-sub', c.get('authUser')?.token?.sub!)
        const req = new Request(c.req.raw, { headers })
        const res = await routePartykitRequest(req, env(c))
        return res ?? c.text('Not Found', 404)
})

type Env = { DB: D1Database; R2: R2Bucket }

const app = new Hono<{ Bindings: Env }>()
        .use('*', googleOAuthMiddleware)
        .use('/api/auth/*', authHandler())
        .use('/parties/*', verifyAuth())
        .use('/parties/*', myMiddleware)

type Conn = Connection<{ username: string }>

export class PartyServer extends Server<Env> {
        users = {} as Record<string, [number, number]>
        static options = { hibernate: true }
        async onConnect(conn: Conn, c: ConnectionContext) {
                const sub = c.request.headers.get('x-auth-sub')!
                const [u] = await getUserBySub(this.env.DB, sub)
                conn.setState({ username: u.name! })
        }
        async onMessage(conn: Conn, message: string) {
                this.users[conn.state!.username] = JSON.parse(message)
                this.broadcast(JSON.stringify(this.users))
        }
        onClose(conn: Conn) {
                delete this.users[conn.state!.username]
                this.broadcast(JSON.stringify(this.users), [conn.id])
        }
}

export default app
