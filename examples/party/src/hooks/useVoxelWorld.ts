import useSWRInfinite from 'swr/infinite'
import { stitchAtlas, chunkId, createChunks, encodePng, gather, importWasm, loader, meshing, atlasToVox, normalizeVox } from '../helpers'
import type { Atlas, Meshes } from '../helpers'

const toTile = (lat = 0, lng = 0, z = 0) => {
        const s = Math.sin((lat * Math.PI) / 180)
        const n = 1 << z
        const x = Math.floor(((lng + 180) / 360) * n)
        const y = Math.floor(((1 - Math.log((1 + s) / (1 - s)) / Math.PI) / 2) * n)
        return { i: x, j: y, k: z }
}

const fillChunk = (vox: Map<string, Uint8Array>) => {
        const map = createChunks()
        for (const [k, rgba] of vox) {
                const [ci, cz, cy] = k.split('.').map((v: string) => parseInt(v) | 0)
                const id = chunkId(ci, cy, cz)
                const ch = map.get(id)
                if (!ch) continue
                const out = new Uint8Array(16 * 16 * 16)
                for (let t = 0, v = 3; t < out.length; t++, v += 4) out[t] = rgba[v] > 0 ? 1 : 0
                ch.vox.set(out)
                ch.visible = true
                ch.dirty = true
                ch.gen = true
        }
        meshing(map)
        return gather(map)
}

const SWR_CONFIG = { keepPreviousData: true, revalidateOnFocus: false, revalidateIfStale: false }

export const useVoxelWorld = (region: { lat: number; lng: number; zoom: number }) => {
        const keys = ['vox-world', Number(region.lat).toFixed(4), Number(region.lng).toFixed(4), String(region.zoom)] as const
        const getKey = (index: number) => {
                if (index > 0) return null
                return [keys, ''] as const
        }
        const fetcher = async () => {
                const { lat, lng, zoom } = region
                const q = `/api/v1/atlas?lat=${lat}&lng=${lng}&zoom=${zoom}`
                const head = await fetch(q, { method: 'HEAD' })
                if (head.ok) {
                        console.log(q)
                        const res = await fetch(q)
                        const ab = await res.arrayBuffer()
                        const vox = await atlasToVox(ab)
                        const m = fillChunk(vox)
                        const t = toTile(lat, lng, zoom)
                        return { atlas: { src: q, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 } as Atlas, mesh: { pos: m.pos, scl: m.scl, cnt: m.cnt, vertex: [], normal: [] } as Meshes, region: t }
                }
                try {
                        const wasm: any = await importWasm()
                        const res = await fetch('/model/monkey.glb')
                        const buf = await res.arrayBuffer()
                        const parsed = await loader(buf)
                        const items = wasm.voxelize_glb(parsed, 16, 16, 16)
                        const rgba = stitchAtlas(items)
                        const png = await encodePng(rgba, 4096, 4096)
                        await fetch(q, { method: 'PUT', body: png })
                        const t = toTile(lat, lng, zoom)
                        await fetch('/api/v1/region', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ world: 'default', i: t.i, j: t.j, k: t.k, url: `atlas/${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}_${zoom}.png` }) })
                        const m = fillChunk(normalizeVox(items))
                        console.log(q)
                        return { atlas: { src: q, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }, mesh: { pos: m.pos, scl: m.scl, cnt: m.cnt, vertex: [], normal: [] }, region: toTile(lat, lng, zoom) }
                } catch (e) {
                        // ↓↓↓ DO NOT CHANGE ↓↓↓
                        console.warn(e) // ← DO NOT CHANGE
                        // ↑↑↑ DO NOT CHANGE ↑↑↑
                }
        }
        const swr = useSWRInfinite(getKey as any, fetcher as any, { revalidateFirstPage: false, ...SWR_CONFIG })
        // ↓↓↓ DO NOT CHANGE ↓↓↓
        console.log(swr.data) // ← DO NOT CHANGE
        // ↑↑↑ DO NOT CHANGE ↑↑↑
        return swr
}
