// index.tsx
import Google from '@auth/core/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { logger } from 'hono/logger'
import { createMiddleware } from 'hono/factory'
import { routePartykitRequest, Server } from 'partyserver'
import * as Q from './queries'
import { encodeSemanticVoxel, decodeSemanticVoxel } from './helpers/voxel/colors'
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
        return res ?? c.text('Not Found', { status: 404 })
})
/**
 * ↑↑↑　DO NOT CHANGE ↑↑↑
 */

type Env = { DB: D1Database; R2: R2Bucket; CESIUM_API_KEY: string }

const app = new Hono<{ Bindings: Env }>()
        .use('*', googleOAuthMiddleware)
        .use('/api/auth/*', authHandler())
        .use('/parties/*', verifyAuth())
        .use('/parties/*', myMiddleware)
        .use('/api/v1/*', verifyAuth())
        .use('/api/v1/*', logger())
        .get('/api/v1/res', (c) => c.text('ok'))
        .get('/api/v1/profile', async (c) => {
                const user = c.get('authUser')?.token?.sub!
                const profile = await Q.getProfile(c.env.DB, user)
                return c.json(profile)
        })
        .post('/api/v1/profile', async (c) => {
                const user = c.get('authUser')?.token?.sub!
                const { culturalIdentity } = await c.req.json()
                await Q.createProfile(c.env.DB, user, culturalIdentity)
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
                return c.json({ error: 'Missing parameters' }, { status: 400 })
        })
        .post('/api/v1/worlds', async (c) => {
                const user = c.get('authUser')?.token?.sub!
                const { worldName, culturalTheme } = await c.req.json()
                const world = await Q.createWorld(c.env.DB, worldName, culturalTheme, user)
                return c.json(world)
        })
        .get('/api/v1/voxels/:chunkId', async (c) => {
                const chunkId = c.req.param('chunkId')
                const voxels = await Q.getSemanticVoxels(c.env.DB, chunkId)
                // Return voxels with semantic data properly formatted and decoded
                const semanticVoxels = voxels.map((v) => {
                        const decodedVoxel = decodeSemanticVoxel(
                                encodeSemanticVoxel({
                                        primaryKanji: v.primaryKanji || '桜',
                                        secondaryKanji: v.secondaryKanji || '色',
                                        rgbValue: v.rgbValue,
                                        alphaProperties: v.alphaProperties || 255,
                                        behavioralSeed: v.behavioralSeed || 0,
                                })
                        )
                        return {
                                ...v,
                                semanticData: {
                                        primaryKanji: v.primaryKanji,
                                        secondaryKanji: v.secondaryKanji,
                                        alphaProperties: v.alphaProperties,
                                        behavioralSeed: v.behavioralSeed,
                                        encoded: encodeSemanticVoxel({
                                                primaryKanji: v.primaryKanji || '桜',
                                                secondaryKanji: v.secondaryKanji || '色',
                                                rgbValue: v.rgbValue,
                                                alphaProperties: v.alphaProperties || 255,
                                                behavioralSeed: v.behavioralSeed || 0,
                                        }),
                                        decoded: decodedVoxel,
                                },
                        }
                })
                return c.json(semanticVoxels)
        })
        .post('/api/v1/voxels', async (c) => {
                const user = c.get('authUser')?.token?.sub!
                const { chunkId, localX, localY, localZ, primaryKanji, secondaryKanji, rgbValue, alphaProperties, behavioralSeed } = await c.req.json()

                // Create semantic voxel with validation and encoding
                const semanticVoxelData = {
                        primaryKanji: primaryKanji || '桜',
                        secondaryKanji: secondaryKanji || '色',
                        rgbValue: rgbValue || 0xfef4f4,
                        alphaProperties: alphaProperties || 255,
                        behavioralSeed: behavioralSeed || 0,
                }

                // Encode and decode to validate semantic data
                const encoded = encodeSemanticVoxel(semanticVoxelData)
                const decoded = decodeSemanticVoxel(encoded)

                const voxel = await Q.createSemanticVoxel(c.env.DB, chunkId || 'default', localX || 0, localY || 0, localZ || 0, semanticVoxelData.primaryKanji, semanticVoxelData.secondaryKanji, semanticVoxelData.rgbValue, user, semanticVoxelData.alphaProperties, semanticVoxelData.behavioralSeed)

                return c.json({
                        ...voxel,
                        semanticData: {
                                encoded,
                                decoded,
                                validated: true,
                        },
                })
        })
        .get('/api/v1/colors', async (c) => {
                const seasonalAssociation = c.req.query('season')
                const colors = await Q.getColors(c.env.DB, seasonalAssociation)
                // Parse JSON fields for client consumption
                const parsedColors = colors.map((color) => ({
                        ...color,
                        culturalSignificance: typeof color.culturalSignificance === 'string' ? JSON.parse(color.culturalSignificance || '{}') : color.culturalSignificance,
                        historicalContext: typeof color.historicalContext === 'string' ? JSON.parse(color.historicalContext || '{}') : color.historicalContext,
                        usageGuidelines: typeof color.usageGuidelines === 'string' ? JSON.parse(color.usageGuidelines || '{}') : color.usageGuidelines,
                }))
                return c.json(parsedColors)
        })
        .get('/api/v1/events', async (c) => {
                const from = new Date().toISOString()
                const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                const events = await Q.getEvents(c.env.DB, new Date(from), new Date(to))
                return c.json(events)
        })
        .on('HEAD', '/api/v1/atlas', async (c) => {
                const lat = c.req.query('lat')
                const lng = c.req.query('lng')
                const zoom = c.req.query('zoom')
                if (!lat || !lng || !zoom) return c.body(null, { status: 400 })
                const key = `atlas/${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}_${zoom}.png`
                const obj = await c.env.R2.head(key)
                if (!obj) return c.body(null, { status: 404 })
                if ((obj as any).size === 0) return c.body(null, { status: 404 })
                return c.body(null, { status: 200 })
        })
        .get('/api/v1/atlas/exists', async (c) => {
                const lat = c.req.query('lat')
                const lng = c.req.query('lng')
                const zoom = c.req.query('zoom')
                if (!lat || !lng || !zoom) return c.body(null, { status: 400 })
                const key = `atlas/${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}_${zoom}.png`
                const obj = await c.env.R2.head(key)
                if (!obj) return c.body(null, { status: 404 })
                if ((obj as any).size === 0) return c.body(null, { status: 404 })
                return c.body(null, { status: 200 })
        })
        .get('/api/v1/atlas', async (c) => {
                const lat = c.req.query('lat')
                const lng = c.req.query('lng')
                const zoom = c.req.query('zoom')
                if (!lat || !lng || !zoom) return c.json({ error: 'missing' }, { status: 400 })
                const key = `atlas/${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}_${zoom}.png`
                const obj = await c.env.R2.get(key)
                if (!obj) return c.json({ error: 'not found' }, { status: 404 })
                const head = await c.env.R2.head(key)
                if (!head || (head as any).size === 0) return c.json({ error: 'empty' }, { status: 404 })
                const body = await obj.arrayBuffer()
                if (!body || body.byteLength === 0) return c.json({ error: 'empty' }, { status: 404 })
                return new Response(body, { headers: { 'content-type': 'image/png' } })
        })
        .put('/api/v1/atlas', async (c) => {
                const lat = c.req.query('lat')
                const lng = c.req.query('lng')
                const zoom = c.req.query('zoom')
                if (!lat || !lng || !zoom) return c.json({ error: 'missing' }, { status: 400 })
                const key = `atlas/${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}_${zoom}.png`
                const ab = await c.req.arrayBuffer()
                if (!ab || ab.byteLength === 0) return c.json({ error: 'empty body' }, { status: 400 })
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
                if (!user) return c.json({ error: 'Not authenticated' }, { status: 401 })
                const { communityName, culturalFocus } = await c.req.json()
                const community = await Q.createCommunity(c.env.DB, communityName, culturalFocus, user)
                return c.json(community)
        })
        .post('/api/v1/communities/:communityId/join', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, { status: 401 })
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
                if (!user) return c.json({ error: 'Not authenticated' }, { status: 401 })
                const { colorId, usageContext, appropriatenessScore } = await c.req.json()
                await Q.recordColorUsage(c.env.DB, colorId, user, usageContext, appropriatenessScore)
                return c.json({ success: true })
        })
        .post('/api/v1/knowledge/share', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, { status: 401 })
                const { communityId, knowledgeType, Wisdom, culturalContext } = await c.req.json()
                await Q.shareKnowledge(c.env.DB, communityId, user, knowledgeType, Wisdom, culturalContext)
                return c.json({ success: true })
        })
        .get('/api/v1/chunks', async (c) => c.json({ count: 0 }))
        .get('/api/v1/cesium/:assetId', async (c) => {
                const assetId = parseInt(c.req.param('assetId'))
                if (!c.env.CESIUM_API_KEY) return c.body(null, { status: 500 })
                const endpointUrl = `https://api.cesium.com/v1/assets/${assetId}/endpoint`
                const epRes = await fetch(endpointUrl, { headers: { Authorization: `Bearer ${c.env.CESIUM_API_KEY}` } })
                if (!epRes.ok) return c.body(null, { status: 502 })
                const ep = (await epRes.json()) as any
                if (!ep || !ep.url) return c.body(null, { status: 502 })
                const token = ep.accessToken || ep.token || ''
                const headers = token ? { Authorization: `Bearer ${token}` } : void 0
                const fileRes = await fetch(ep.url, { headers })
                if (!fileRes.ok) return c.body(null, { status: 502 })
                const contentType = fileRes.headers.get('content-type') || 'model/gltf-binary'
                const respHeaders = { 'content-type': contentType, 'cache-control': 'public, max-age=3600' }
                return new Response(fileRes.body, { headers: respHeaders })
        })
        .get('/api/v1/cesium/:assetId/tileset', async (c) => {
                const assetId = parseInt(c.req.param('assetId'))
                if (!c.env.CESIUM_API_KEY) return c.body(null, { status: 500 })
                const endpointUrl = `https://api.cesium.com/v1/assets/${assetId}/endpoint`
                const epRes = await fetch(endpointUrl, { headers: { Authorization: `Bearer ${c.env.CESIUM_API_KEY}` } })
                if (!epRes.ok) return c.body(null, { status: 502 })
                const ep = (await epRes.json()) as any
                if (!ep || !ep.url) return c.body(null, { status: 502 })
                const token = ep.accessToken || ep.token || ''
                const headers = token ? { Authorization: `Bearer ${token}` } : void 0
                const ts = await fetch(ep.url, { headers })
                if (!ts.ok) return c.body(null, { status: 502 })
                const body = await ts.arrayBuffer()
                return new Response(body, { headers: { 'content-type': 'application/json' } })
        })
        .get('/api/v1/cesium/:assetId/content', async (c) => {
                const assetId = parseInt(c.req.param('assetId'))
                const src = c.req.query('src') || ''
                if (!src) return c.body(null, { status: 400 })
                if (!c.env.CESIUM_API_KEY) return c.body(null, { status: 500 })
                const endpointUrl = `https://api.cesium.com/v1/assets/${assetId}/endpoint`
                const epRes = await fetch(endpointUrl, { headers: { Authorization: `Bearer ${c.env.CESIUM_API_KEY}` } })
                if (!epRes.ok) return c.body(null, { status: 502 })
                const ep = (await epRes.json()) as any
                const token = ep.accessToken || ep.token || ''
                const headers = token ? { Authorization: `Bearer ${token}` } : void 0
                const base = new URL(ep.url)
                const abs = new URL(src, base)
                const res2 = await fetch(abs.toString(), { headers })
                if (!res2.ok) return c.body(null, { status: 502 })
                const ct = res2.headers.get('content-type') || 'application/octet-stream'
                return new Response(res2.body, { headers: { 'content-type': ct } })
        })

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
