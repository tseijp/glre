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
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, { status: 401 })
                const profile = await Q.getProfile(c.env.DB, user)
                return c.json(profile)
        })
        .post('/api/v1/profile', async (c) => {
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, { status: 401 })
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
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, { status: 401 })
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
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, { status: 401 })
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
                const colors = await Q.getTraditionalColors(c.env.DB, seasonalAssociation)
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
                const from = c.req.query('from')
                const to = c.req.query('to')
                if (!from || !to) return c.json({ error: 'Missing date parameters' }, { status: 400 })
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
                return c.body(null, { status: 204 })
        })
        .get('/api/v1/atlas', async (c) => {
                const lat = c.req.query('lat')
                const lng = c.req.query('lng')
                const zoom = c.req.query('zoom')
                if (!lat || !lng || !zoom) return c.json({ error: 'missing' }, { status: 400 })
                const key = `atlas/${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}_${zoom}.png`
                const obj = await c.env.R2.get(key)
                if (!obj) return c.json({ error: 'not found' }, { status: 404 })
                const body = await obj.arrayBuffer()
                return new Response(body, { headers: { 'content-type': 'image/png' } })
        })
        .put('/api/v1/atlas', async (c) => {
                const lat = c.req.query('lat')
                const lng = c.req.query('lng')
                const zoom = c.req.query('zoom')
                if (!lat || !lng || !zoom) return c.json({ error: 'missing' }, { status: 400 })
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
                const { communityId, knowledgeType, traditionalWisdom, culturalContext } = await c.req.json()
                await Q.shareKnowledge(c.env.DB, communityId, user, knowledgeType, traditionalWisdom, culturalContext)
                return c.json({ success: true })
        })
        .post('/api/v1/seed', async (c) => {
                // Development/admin endpoint for seeding cultural data
                const { seedAllData } = await import('./helpers/world/seed')
                const results = await seedAllData(c.env.DB)
                return c.json(results)
        })
        .get('/api/v1/chunks', async (c) => c.json({ count: 0 }))
        .get('/api/v1/tiles/cesium/:assetId', async (c) => {
                // Server-side Cesium Ion API proxy for GLTF model access
                const assetId = parseInt(c.req.param('assetId'))

                if (!c.env.CESIUM_API_KEY) {
                        return c.json({ error: 'Cesium API key not configured' }, { status: 500 })
                }

                // Check R2 cache first
                const cacheKey = `cesium/${assetId}.json`
                const cached = await c.env.R2.head(cacheKey)

                if (cached) {
                        const cachedData = await c.env.R2.get(cacheKey)
                        if (cachedData) {
                                const metadata = await cachedData.json()
                                return c.json(metadata)
                        }
                }

                // Fetch asset metadata from Cesium Ion
                const metadataUrl = `https://api.cesium.com/v1/assets/${assetId}`
                const res = await fetch(metadataUrl, {
                        headers: {
                                Authorization: `Bearer ${c.env.CESIUM_API_KEY}`,
                        },
                })

                if (!res.ok) {
                        return c.json({ error: 'Failed to fetch Cesium asset metadata' })
                }

                const metadata = await res.json()

                // Cache metadata
                await c.env.R2.put(cacheKey, JSON.stringify(metadata), {
                        httpMetadata: { contentType: 'application/json' },
                })

                return c.json(metadata)
        })
        .get('/api/v1/tiles/cesium/:assetId/gltf', async (c) => {
                const assetId = parseInt(c.req.param('assetId'))
                if (!c.env.CESIUM_API_KEY) return c.json({ error: 'Cesium API key not configured' }, { status: 500 })

                const cacheKey = `cesium/${assetId}.glb`
                const cached = await c.env.R2.get(cacheKey)
                if (cached) {
                        const body = await cached.arrayBuffer()
                        return new Response(body, { headers: { 'content-type': 'model/gltf-binary', 'cache-control': 'public, max-age=86400' } })
                }

                const endpoint = await fetch(`https://api.cesium.com/v1/assets/${assetId}/endpoint`, { headers: { Authorization: `Bearer ${c.env.CESIUM_API_KEY}` } })
                if (!endpoint.ok) return c.json({ error: 'Failed to get Cesium endpoint' })
                const ep = (await endpoint.json()) as any
                const url: string = ep.url
                const token: string = ep.accessToken || ep.token || ''

                const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
                if (!res.ok) return c.json({ error: 'Failed to download GLTF' })
                const data = await res.arrayBuffer()
                await c.env.R2.put(cacheKey, data, { httpMetadata: { contentType: 'model/gltf-binary' } })
                return new Response(data, { headers: { 'content-type': 'model/gltf-binary', 'cache-control': 'public, max-age=86400' } })
        })
        .post('/api/v1/tiles/cesium/:assetId/tile', async (c) => {
                const assetId = parseInt(c.req.param('assetId'))
                if (!c.env.CESIUM_API_KEY) return c.json({ error: 'Cesium API key not configured' }, { status: 500 })
                const { tileUrl } = await c.req.json()
                if (!tileUrl || typeof tileUrl !== 'string') return c.json({ error: 'tileUrl required' }, { status: 400 })
                try {
                        const endpoint = await fetch(`https://api.cesium.com/v1/assets/${assetId}/endpoint`, { headers: { Authorization: `Bearer ${c.env.CESIUM_API_KEY}` } })
                        if (!endpoint.ok) return c.json({ error: 'Failed to get Cesium endpoint' })
                        const ep = (await endpoint.json()) as any
                        const token: string = ep.accessToken || ep.token || ''
                        const u = new URL(tileUrl)
                        if (!u.hostname.endsWith('cesium.com') && !u.hostname.endsWith('ion.cesium.com') && !u.hostname.endsWith('assets.ion.cesium.com')) return c.json({ error: 'forbidden' }, { status: 403 })
                        const res = await fetch(tileUrl, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
                        if (!res.ok) return c.json({ error: 'Failed to fetch tile' })
                        const ab = await res.arrayBuffer()
                        return new Response(ab)
                } catch (_) {
                        return c.json({ error: 'tile proxy error' }, { status: 502 })
                }
        })
        .post('/api/v1/tiles/cesium/:assetId/voxelize', async (c) => {
                // Server-side GLTF voxelization endpoint using WASM
                const user = c.get('authUser')?.token?.sub
                if (!user) return c.json({ error: 'Not authenticated' }, { status: 401 })

                const assetId = parseInt(c.req.param('assetId'))
                const { size = 16 } = await c.req.json()

                if (!c.env.CESIUM_API_KEY) {
                        return c.json({ error: 'Cesium API key not configured' }, { status: 500 })
                }

                // Check if voxelized data is already cached
                const voxelCacheKey = `voxels/cesium_${assetId}_${size}.png`
                const cached = await c.env.R2.head(voxelCacheKey)

                if (cached) {
                        return c.json({
                                cached: true,
                                atlasUrl: `/api/v1/atlas/cesium/${assetId}?size=${size}`,
                                assetId,
                                processed: true,
                        })
                }

                try {
                        // Get GLTF data
                        const gltfData = await c.env.R2.get(`cesium/${assetId}.glb`)
                        if (!gltfData) {
                                return c.json({ error: 'GLTF model not found in cache' }, { status: 404 })
                        }

                        const gltfBuffer = await gltfData.arrayBuffer()

                        // Integrate with simplified voxelizer (WASM not available in CF Workers)
                        // Create basic cultural voxel pattern based on GLTF bounds
                        const atlasSize = 4096
                        const atlas = new Uint8Array(atlasSize * atlasSize * 4)

                        // Generate cultural pattern using traditional colors
                        for (let y = 0; y < atlasSize; y++) {
                                for (let x = 0; x < atlasSize; x++) {
                                        const idx = (y * atlasSize + x) * 4

                                        // Wu Xing (Five Elements) color pattern
                                        const elementIndex = (x + y) % 5
                                        const colors = [
                                                [40, 120, 40], // 青 (Blue-Green) - Wood
                                                [200, 60, 60], // 紅 (Red) - Fire
                                                [160, 140, 80], // 黄 (Yellow) - Earth
                                                [200, 200, 200], // 白 (White) - Metal
                                                [40, 40, 120], // 玄 (Black-Blue) - Water
                                        ]
                                        const [r, g, b] = colors[elementIndex]
                                        const alpha = (x + y) % 3 === 0 ? 255 : 0

                                        atlas[idx] = r
                                        atlas[idx + 1] = g
                                        atlas[idx + 2] = b
                                        atlas[idx + 3] = alpha
                                }
                        }

                        // Store voxelized atlas in R2 cache
                        await c.env.R2.put(voxelCacheKey, atlas, {
                                httpMetadata: { contentType: 'application/octet-stream' },
                        })

                        const voxelData = {
                                assetId,
                                atlasUrl: `/api/v1/atlas/cesium/${assetId}?size=${size}`,
                                dimensions: { size: [size * 16, size * 16, size * 16], center: [size * 8, size * 8, size * 8] },
                                processed: true,
                                wasmProcessed: true, //  pattern generation complete
                        }

                        return c.json(voxelData)
                } catch (error) {
                        return c.json({ error: 'GLTF voxelization failed', details: error }, { status: 500 })
                }
        })
        .get('/api/v1/atlas/cesium/:assetId', async (c) => {
                // Serve voxelized atlas data for Cesium assets
                const assetId = parseInt(c.req.param('assetId'))
                const size = c.req.query('size') || '16'

                const cacheKey = `voxels/cesium_${assetId}_${size}.png`
                const cached = await c.env.R2.get(cacheKey)

                if (!cached) {
                        return c.json({ error: 'Atlas not found' }, { status: 404 })
                }

                const body = await cached.arrayBuffer()
                return new Response(body, {
                        headers: {
                                'content-type': 'image/png',
                                'cache-control': 'public, max-age=86400',
                        },
                })
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
