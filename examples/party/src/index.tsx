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

type Env = { DB: D1Database; R2: R2Bucket; CESIUM_API_KEY: string; GOOGLE_MAP_API_KEY: string }

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
        .get('/api/v1/clear', async (c) => {
                await Q.clear(c.env.DB, c.env.R2)
                return c.redirect('/api/auth/signin')
        })
        .get('/api/v1/region', async (c) => {
                const world = c.req.query('world') || 'default'
                const i = parseInt(c.req.query('i') || '0') | 0
                const j = parseInt(c.req.query('j') || '0') | 0
                const k = parseInt(c.req.query('k') || '0') | 0
                const [w] = await Q.getWorldByName(c.env.DB, world)
                if (!w) return c.json({ error: 'world not found' }, { status: 404 })
                const [r] = await Q.getRegionByCoords(c.env.DB, w.worldId, i, j, k)
                if (!r) return c.json({ error: 'region not found' }, { status: 404 })
                return c.json(r)
        })
        .post('/api/v1/region', async (c) => {
                const user = c.get('authUser')?.token?.sub!
                const { world = 'default', i, j, k, url } = await c.req.json()
                const [w] = await Q.getWorldByName(c.env.DB, world)
                const W = w || (await Q.createWorld(c.env.DB, world, 'default', user))
                const [r] = await Q.getRegionByCoords(c.env.DB, W.worldId, i | 0, j | 0, k | 0)
                if (!r) return c.json(await Q.insertRegion(c.env.DB, W.worldId, i | 0, j | 0, k | 0, String(url)))
                return c.json((await Q.updateRegionPng(c.env.DB, r.regionId, String(url))) || r)
        })
        .on('HEAD', '/api/v1/atlas', async (c) => {
                const rx = c.req.query('rx')
                const rz = c.req.query('rz')
                if (!rx || !rz) return c.body(null, { status: 400 })
                const key = `atlas/${rx}_${rz}.png`
                const obj = await c.env.R2.head(key)
                if (!obj) return c.body(null, { status: 404 })
                if ((obj as any).size === 0) return c.body(null, { status: 404 })
                return c.body(null, { status: 200 })
        })
        .get('/api/v1/atlas/exists', async (c) => {
                const rx = c.req.query('rx')
                const rz = c.req.query('rz')
                if (!rx || !rz) return c.body(null, { status: 400 })
                const key = `atlas/${rx}_${rz}.png`
                const obj = await c.env.R2.head(key)
                if (!obj) return c.body(null, { status: 404 })
                if ((obj as any).size === 0) return c.body(null, { status: 404 })
                return c.body(null, { status: 200 })
        })
        .get('/api/v1/atlas', async (c) => {
                const rx = c.req.query('rx')
                const rz = c.req.query('rz')
                if (!rx || !rz) return c.json({ error: 'missing' }, { status: 400 })
                const key = `atlas/${rx}_${rz}.png`
                const obj = await c.env.R2.get(key)
                if (!obj) return c.json({ error: 'not found' }, { status: 404 })
                const head = await c.env.R2.head(key)
                if (!head || (head as any).size === 0) return c.json({ error: 'empty' }, { status: 404 })
                const body = await obj.arrayBuffer()
                if (!body || body.byteLength === 0) return c.json({ error: 'empty' }, { status: 404 })
                return new Response(body, { headers: { 'content-type': 'image/png' } })
        })
        .put('/api/v1/atlas', async (c) => {
                const rx = c.req.query('rx')
                const rz = c.req.query('rz')
                if (!rx || !rz) return c.json({ error: 'missing' }, { status: 400 })
                const key = `atlas/${rx}_${rz}.png`
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
        .get('/api/v1/r2', async (c) => {
                const prefix = c.req.query('prefix') ?? undefined
                const list = await c.env.R2.list({ prefix, limit: 1000 })
                return c.json(
                        list.objects.map((o) => ({
                                key: o.key,
                                size: o.size,
                                uploaded: o.uploaded,
                                etag: o.etag,
                        }))
                )
        })
        .get('/api/v1/r2/*', async (c) => {
                const url = new URL(c.req.url)
                const prefix = '/api/v1/r2/'
                const key = decodeURIComponent(url.pathname.slice(prefix.length))
                if (!key) return c.text('key required', 400)
                const obj = await c.env.R2.get(key)
                if (!obj) return c.text('Not Found', 404)
                const type = obj.httpMetadata?.contentType ?? 'application/octet-stream'
                return new Response(obj.body, { headers: { 'Content-Type': type } })
        })
        .get('/api/v1/google-proxy/tileset', async (c) => {
                const apiKey = c.env.GOOGLE_MAP_API_KEY
                if (!apiKey) return c.json({ error: 'api key not configured' }, { status: 500 })
                const url = `https://tile.googleapis.com/v1/3dtiles/root.json`
                const response = await fetch(url, {
                        headers: { 'X-GOOG-API-KEY': apiKey },
                })
                if (!response.ok) return c.json({ error: 'google api error' })
                const data = await response.json()
                return c.json(data)
        })
        .get('/api/v1/google-proxy/tile', async (c) => {
                const uri = c.req.query('uri')
                if (!uri) return c.json({ error: 'missing uri' }, { status: 400 })
                const apiKey = c.env.GOOGLE_MAP_API_KEY
                if (!apiKey) return c.json({ error: 'api key not configured' }, { status: 500 })
                const decodedUri = decodeURIComponent(uri)
                const baseUrl = 'https://tile.googleapis.com'
                const fullUrl = decodedUri.startsWith('http') ? decodedUri : `${baseUrl}${decodedUri}`
                const response = await fetch(fullUrl, {
                        headers: { 'X-GOOG-API-KEY': apiKey },
                })
                if (!response.ok) return c.json({ error: 'google api error' })
                const data = await response.arrayBuffer()
                return new Response(data, {
                        headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream' },
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
