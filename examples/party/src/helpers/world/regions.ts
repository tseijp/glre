import { chunkId, importWasm } from '../utils'
import { atlasToVox, encodePng, itemsToVox, stitchAtlas } from '../voxel/atlas'
import { loader } from '../voxel/loader'
import { createChunks, gather, meshing } from './chunk'

// @TODO FIX
const toTile = (lat = 0, lng = 0, z = 0) => {
        const s = Math.sin((lat * Math.PI) / 180)
        const n = 1 << z
        const x = Math.floor(((lng + 180) / 360) * n)
        const y = Math.floor(((1 - Math.log((1 + s) / (1 - s)) / Math.PI) / 2) * n)
        return { i: x, j: y, k: z }
}

const fillChunk = (vox: Map<string, Uint8Array>) => {
        const chunks = createChunks()
        for (const [k, rgba] of vox) {
                const [ci, cz, cy] = k.split('.').map((v: string) => parseInt(v) | 0)
                const id = chunkId(ci, cy, cz)
                const ch = chunks.get(id)
                if (!ch) continue
                const out = new Uint8Array(16 * 16 * 16)
                for (let t = 0, v = 3; t < out.length; t++, v += 4) out[t] = rgba[v] > 0 ? 1 : 0
                ch.vox.set(out)
                ch.visible = true
                ch.dirty = true
                ch.gen = true
        }
        meshing(chunks)
        // @TODO culling
        const mesh = gather(chunks)
        return { mesh, chunks }
}

export type RegionConfig = {
        lat: number
        lng: number
        zoom: number
}

export const createRegions = (config: RegionConfig = { lat: 35.6762, lng: 139.6503, zoom: 15 }) => {
        const regions = new Map()
        const getKey = (index: number) => {
                const keys = ['vox-world', Number(config.lat).toFixed(4), Number(config.lng).toFixed(4), String(config.zoom)] as const
                return keys // @TODO FIX
        }
        const fetcher = async () => {
                const { lat, lng, zoom } = config
                const q = `/api/v1/atlas?lat=${lat}&lng=${lng}&zoom=${zoom}`
                const head = await fetch(q, { method: 'HEAD' })
                const { i, j, k } = toTile(lat, lng, zoom)
                if (head.ok) {
                        const res = await fetch(q)
                        const ab = await res.arrayBuffer()
                        const vox = await atlasToVox(ab)
                        return { atlas: { src: q, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }, i, j, k, ...config, ...fillChunk(vox) }
                }
                try {
                        const wasm: any = await importWasm()
                        const res = await fetch('/model/monkey.glb')
                        const buf = await res.arrayBuffer()
                        const parsed = await loader(buf)
                        const items = wasm.voxelize_glb(parsed, 16, 16, 16)
                        const png = await encodePng(stitchAtlas(items), 4096, 4096)
                        await Promise.all([
                                fetch(q, { method: 'PUT', body: png }), //
                                fetch('/api/v1/region', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ world: 'default', i, j, k, url: `atlas/${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}_${zoom}.png` }) }),
                        ])
                        const vox = itemsToVox(items)
                        return { atlas: { src: q, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }, i, j, k, ...config, ...fillChunk(vox) }
                } catch (e) {
                        // ↓↓↓ DO NOT CHANGE ↓↓↓
                        console.warn(e) // ← DO NOT CHANGE
                        // ↑↑↑ DO NOT CHANGE ↑↑↑
                }
        }
        const updateCamera = () => {}
        return { getKey, fetcher }
}
