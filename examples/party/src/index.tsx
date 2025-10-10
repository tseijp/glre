// index.tsx
import Google from '@auth/core/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { createMiddleware } from 'hono/factory'
import { routePartykitRequest, Server } from 'partyserver'
import { getUserBySub, getCulturalProfile, getWorldsByCreator, getPublicWorlds, getSemanticVoxels, getTraditionalColors, getCulturalEvents, getCommunityMembers, getEducationalContent, createCulturalProfile, createWorld, createSemanticVoxel, createCommunity, joinCommunity, recordColorUsage, shareKnowledge } from './queries'
import type { Connection, ConnectionContext } from 'partyserver'

/**
 * ↓↓↓　DO NOT CHANGE ↓↓↓
 */
const googleOAuthMiddleware = initAuthConfig((c) => ({
        adapter: DrizzleAdapter(drizzle(c.env.DB)),
        providers: [Google({ clientId: c.env.GOOGLE_ID, clientSecret: c.env.GOOGLE_SECRET })],
        secret: c.env.AUTH_SECRET,
        session: { strategy: 'jwt' },
}))

const myMiddleware = createMiddleware(async (c) => {
        const headers = new Headers(c.req.raw.headers)
        headers.set('x-auth-sub', c.get('authUser')?.token?.sub!)
        const req = new Request(c.req.raw, { headers })
        const res = await routePartykitRequest(req, env(c))
        return res ?? c.text('Not Found', 404)
})
/**
 * ↑↑↑　DO NOT CHANGE ↑↑↑
 */

type Env = { DB: D1Database; R2: R2Bucket }

const app = new Hono<{ Bindings: Env }>()
        .use('*', googleOAuthMiddleware)
        .use('/api/auth/*', authHandler())
        .use('/parties/*', verifyAuth())
        .use('/parties/*', myMiddleware)
        .get('/api/v1/res', (c) => c.text('ok'))
        .get('/api/v1/profile', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const profile = await getCulturalProfile(c.env.DB, user)
                return c.json(profile)
        })
        .post('/api/v1/profile', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const { culturalIdentity } = await c.req.json()
                await createCulturalProfile(c.env.DB, user, culturalIdentity)
                return c.json({ success: true })
        })
        .get('/api/v1/worlds', async (c) => {
                const userId = c.req.query('userId')
                const isPublic = c.req.query('public')
                if (userId) {
                        const worlds = await getWorldsByCreator(c.env.DB, userId)
                        return c.json(worlds)
                }
                if (isPublic === 'true') {
                        const worlds = await getPublicWorlds(c.env.DB)
                        return c.json(worlds)
                }
                return c.json({ error: 'Missing parameters' }, 400)
        })
        .post('/api/v1/worlds', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const { worldName, culturalTheme } = await c.req.json()
                const world = await createWorld(c.env.DB, worldName, culturalTheme, user)
                return c.json(world)
        })
        .get('/api/v1/voxels/:chunkId', async (c) => {
                const chunkId = c.req.param('chunkId')
                const voxels = await getSemanticVoxels(c.env.DB, chunkId)
                return c.json(voxels)
        })
        .post('/api/v1/voxels', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const { chunkId, localX, localY, localZ, primaryKanji, secondaryKanji, rgbValue } = await c.req.json()
                const voxel = await createSemanticVoxel(c.env.DB, chunkId, localX, localY, localZ, primaryKanji, secondaryKanji, rgbValue, user)
                return c.json(voxel)
        })
        .get('/api/v1/colors', async (c) => {
                const seasonalAssociation = c.req.query('season')
                const colors = await getTraditionalColors(c.env.DB, seasonalAssociation)
                return c.json(colors)
        })
        .get('/api/v1/events', async (c) => {
                const from = c.req.query('from')
                const to = c.req.query('to')
                if (!from || !to) return c.json({ error: 'Missing date parameters' }, 400)
                const events = await getCulturalEvents(c.env.DB, new Date(from), new Date(to))
                return c.json(events)
        })
        .get('/api/v1/communities/:communityId/members', async (c) => {
                const communityId = c.req.param('communityId')
                const members = await getCommunityMembers(c.env.DB, communityId)
                return c.json(members)
        })
        .post('/api/v1/communities', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const { communityName, culturalFocus } = await c.req.json()
                const community = await createCommunity(c.env.DB, communityName, culturalFocus, user)
                return c.json(community)
        })
        .post('/api/v1/communities/:communityId/join', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const communityId = c.req.param('communityId')
                await joinCommunity(c.env.DB, communityId, user)
                return c.json({ success: true })
        })
        .get('/api/v1/education', async (c) => {
                const culturalContext = c.req.query('context')
                const difficultyLevel = c.req.query('difficulty')
                const content = await getEducationalContent(c.env.DB, culturalContext, difficultyLevel ? parseInt(difficultyLevel) : undefined)
                return c.json(content)
        })
        .post('/api/v1/colors/usage', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const { colorId, usageContext, appropriatenessScore } = await c.req.json()
                await recordColorUsage(c.env.DB, colorId, user, usageContext, appropriatenessScore)
                return c.json({ success: true })
        })
        .post('/api/v1/knowledge/share', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const { communityId, knowledgeType, traditionalWisdom, culturalContext } = await c.req.json()
                await shareKnowledge(c.env.DB, communityId, user, knowledgeType, traditionalWisdom, culturalContext)
                return c.json({ success: true })
        })

type AppType = typeof app

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

export { AppType }

export default app
