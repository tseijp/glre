// index.tsx
import Google from '@auth/core/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { createMiddleware } from 'hono/factory'
import { routePartykitRequest, Server } from 'partyserver'
import * as Q from './queries'
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
        // .use('/api/v1/*', verifyAuth())
        .get('/api/v1/res', (c) => c.text('ok'))
        .get('/api/v1/profile', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const profile = await Q.getCulturalProfile(c.env.DB, user)
                return c.json(profile)
        })
        .post('/api/v1/profile', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const { culturalIdentity } = await c.req.json()
                await Q.createCulturalProfile(c.env.DB, user, culturalIdentity)
                return c.json({ success: true })
        })
        .get('/api/v1/worlds', async (c) => {
                const userId = c.req.query('userId')
                const isPublic = c.req.query('public')
                if (userId) {
                        const worlds = await Q.getWorldsByCreator(c.env.DB, userId)
                        return c.json(worlds)
                }
                if (isPublic === 'true') {
                        const worlds = await Q.getPublicWorlds(c.env.DB)
                        return c.json(worlds)
                }
                return c.json({ error: 'Missing parameters' }, 400)
        })
        .post('/api/v1/worlds', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const { worldName, culturalTheme } = await c.req.json()
                const world = await Q.createWorld(c.env.DB, worldName, culturalTheme, user)
                return c.json(world)
        })
        .get('/api/v1/voxels/:chunkId', async (c) => {
                const chunkId = c.req.param('chunkId')
                const voxels = await Q.getSemanticVoxels(c.env.DB, chunkId)
                return c.json(voxels)
        })
        .post('/api/v1/voxels', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const { chunkId, localX, localY, localZ, primaryKanji, secondaryKanji, rgbValue, alphaProperties, behavioralSeed } = await c.req.json()
                const voxel = await Q.createSemanticVoxel(c.env.DB, chunkId || 'default', localX || 0, localY || 0, localZ || 0, primaryKanji || '桜', secondaryKanji || '色', rgbValue || 0xfef4f4, user)
                return c.json(voxel)
        })
        .get('/api/v1/colors', async (c) => {
                const seasonalAssociation = c.req.query('season')
                const colors = await Q.getTraditionalColors(c.env.DB, seasonalAssociation)
                return c.json(colors)
        })
        .get('/api/v1/events', async (c) => {
                const from = c.req.query('from')
                const to = c.req.query('to')
                if (!from || !to) return c.json({ error: 'Missing date parameters' }, 400)
                const events = await Q.getCulturalEvents(c.env.DB, new Date(from), new Date(to))
                return c.json(events)
        })
        .head('/api/v1/atlas', async (c) => {
                const lat = c.req.query('lat')
                const lng = c.req.query('lng')
                const zoom = c.req.query('zoom')
                if (!lat || !lng || !zoom) return c.body(null, 400)
                const key = `atlas/${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}_${zoom}.png`
                const obj = await c.env.R2.head(key)
                if (!obj) return c.body(null, 404)
                return c.body(null, 200)
        })
        .get('/api/v1/atlas', async (c) => {
                const lat = c.req.query('lat')
                const lng = c.req.query('lng')
                const zoom = c.req.query('zoom')
                if (!lat || !lng || !zoom) return c.json({ error: 'missing' }, 400)
                const key = `atlas/${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}_${zoom}.png`
                const obj = await c.env.R2.get(key)
                if (!obj) return c.json({ error: 'not found' }, 404)
                const body = await obj.arrayBuffer()
                return new Response(body, { headers: { 'content-type': 'image/png' } })
        })
        .put('/api/v1/atlas', async (c) => {
                const lat = c.req.query('lat')
                const lng = c.req.query('lng')
                const zoom = c.req.query('zoom')
                if (!lat || !lng || !zoom) return c.json({ error: 'missing' }, 400)
                const key = `atlas/${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}_${zoom}.png`
                const ab = await c.req.arrayBuffer()
                await c.env.R2.put(key, ab, { httpMetadata: { contentType: 'image/png' } })
                return c.json({ ok: true, key })
        })
        .get('/api/v1/communities/:communityId/members', async (c) => {
                const communityId = c.req.param('communityId')
                const members = await Q.getCommunityMembers(c.env.DB, communityId)
                return c.json(members)
        })
        .post('/api/v1/communities', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const { communityName, culturalFocus } = await c.req.json()
                const community = await Q.createCommunity(c.env.DB, communityName, culturalFocus, user)
                return c.json(community)
        })
        .post('/api/v1/communities/:communityId/join', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const communityId = c.req.param('communityId')
                await Q.joinCommunity(c.env.DB, communityId, user)
                return c.json({ success: true })
        })
        .get('/api/v1/education', async (c) => {
                const culturalContext = c.req.query('context')
                const difficultyLevel = c.req.query('difficulty')
                const content = await Q.getEducationalContent(c.env.DB, culturalContext, difficultyLevel ? parseInt(difficultyLevel) : undefined)
                return c.json(content)
        })
        .post('/api/v1/colors/usage', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const { colorId, usageContext, appropriatenessScore } = await c.req.json()
                await Q.recordColorUsage(c.env.DB, colorId, user, usageContext, appropriatenessScore)
                return c.json({ success: true })
        })
        .post('/api/v1/knowledge/share', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, 401)
                const { communityId, knowledgeType, traditionalWisdom, culturalContext } = await c.req.json()
                await Q.shareKnowledge(c.env.DB, communityId, user, knowledgeType, traditionalWisdom, culturalContext)
                return c.json({ success: true })
        })
        .post('/api/v1/seed', async (c) => {
                // Development/admin endpoint for seeding cultural data
                const { seedAllCulturalData } = await import('./helpers/world/seed')
                const results = await seedAllCulturalData(c.env.DB)
                return c.json(results)
        })
        .get('/api/v1/chunks', async (c) => c.json({ count: 0 }))

type AppType = typeof app

type Conn = Connection<{ username: string }>

export class PartyServer extends Server<Env> {
        users = {} as Record<string, [number, number]>
        static options = { hibernate: true }
        async onConnect(conn: Conn, c: ConnectionContext) {
                const sub = c.request.headers.get('x-auth-sub')!
                const [u] = await Q.getUserBySub(this.env.DB, sub)
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
