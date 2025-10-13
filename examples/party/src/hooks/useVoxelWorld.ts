import useSWRInfinite from 'swr/infinite'
import { blitChunk64ToWorld, chunkId, createChunks, encodeImagePNG, extractVoxelArraysFromWorldPNG, gather, importWasm, meshing, loadCesiumTiles } from '../helpers'
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
                const [i, j, l] = k.split('.').map((v: string) => parseInt(v) | 0)
                const id = chunkId(i, j, l)
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
        const assetId = 96188

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
                const wasm: any = await importWasm()
                const parsed = await loadCesiumTiles(assetId)
                const items = Array.from(wasm.voxelize_glb(parsed, 16, 16, 16) || []) as any[]
                const rgba = new Uint8Array(4096 * 4096 * 4)
                for (const it of items) {
                        const [ci, cj, ck] = String(it.key)
                                .split('.')
                                .map((v: string) => parseInt(v) | 0)
                        blitChunk64ToWorld(it.rgba, ci, cj, ck, rgba)
                }
                const png = await encodeImagePNG(rgba, 4096, 4096)
                const vox = await extractVoxelArraysFromWorldPNG(png.buffer)
                const m = fill(vox)
                const url = URL.createObjectURL(new Blob([png], { type: 'image/png' }))
                const { i, j, k } = toTile(lat, lng, zoom)
                return {
                        atlas: { src: url, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 } as Atlas,
                        mesh: { pos: m.pos, scl: m.scl, cnt: m.cnt, vertex: [], normal: [] } as Meshes,
                        region: { i, j, k },
                }
        }
        const swr = useSWRInfinite(getKey as any, fetcher as any, { revalidateFirstPage: false, ...SWR_CONFIG })
        return swr
}
