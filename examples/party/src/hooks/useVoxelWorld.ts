import useSWRInfinite from 'swr/infinite'
import { stitchAtlas, chunkId, createChunks, encodePng, tileToVox, gather, importWasm, loader, meshing } from '../helpers'
import type { Atlas, Meshes } from '../helpers'

const toTile = (lat = 0, lng = 0, z = 0) => {
        const s = Math.sin((lat * Math.PI) / 180)
        const n = 1 << z
        const x = Math.floor(((lng + 180) / 360) * n)
        const y = Math.floor(((1 - Math.log((1 + s) / (1 - s)) / Math.PI) / 2) * n)
        return { i: x, j: y, k: z }
}

const fill = (vox: Map<string, Uint8Array>) => {
        const map = createChunks() as any
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
                // const q = `/api/v1/atlas?lat=${lat}&lng=${lng}&zoom=${zoom}`
                // const head = await fetch(q, { method: 'HEAD' })
                // if (head.ok) {
                //         const res = await fetch(q)
                //         const ab = await res.arrayBuffer()
                //         const vox = await extractVoxelArraysFromWorldPNG(ab)
                //         const m = fill(vox)
                //         const { i, j, k } = toTile(lat, lng, zoom)
                //         return { atlas: { src: q, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 } as Atlas, mesh: { pos: m.pos, scl: m.scl, cnt: m.cnt, vertex: [], normal: [] } as Meshes, i, j, k }
                // }
                try {
                        const wasm: any = await importWasm()
                        const res = await fetch('/model/monkey.glb')
                        const buf = await res.arrayBuffer()
                        const parsed = await loader(buf)
                        const items: any[] = wasm.voxelize_glb(parsed, 16, 16, 16) || []
                        const vox = new Map<string, Uint8Array>()
                        for (const it of items) vox.set(String(it.key), tileToVox(it.rgba))
                        const m = fill(vox)
                        const rgba = stitchAtlas(items)
                        const png = await encodePng(rgba, 4096, 4096)
                        const url = URL.createObjectURL(new Blob([png], { type: 'image/png' }))
                        const { i, j, k } = toTile(lat, lng, zoom)
                        return { atlas: { src: url, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 } as Atlas, mesh: { pos: m.pos, scl: m.scl, cnt: m.cnt, vertex: [], normal: [] } as Meshes, region: { i, j, k } }
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
