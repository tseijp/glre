import useSWR from 'swr'
import { useFetch, useSearchParam } from '.'
import { importWasm } from '../helpers/utils'
import type { Atlas, Meshes } from '../helpers/types'
import { blitChunk64ToWorld, encodeImagePNG, extractVoxelArraysFromWorldPNG } from '../helpers/world/atlas'
import { createChunks, applyVoxelDataToChunks, gather } from '../helpers/world/chunk'
import { chunkId } from '../helpers'

const makeDemoParsed = () => {
        const boxes: any[] = []
        for (let z = 0; z < 4; z++) for (let x = 0; x < 4; x++) boxes.push([x * 8, 0, z * 8, 6, 12, 6])
        const tris: any[] = []
        const pushBox = (cx: number, cy: number, cz: number, w: number, h: number, d: number) => {
                const x0 = cx,
                        x1 = cx + w,
                        y0 = cy,
                        y1 = cy + h,
                        z0 = cz,
                        z1 = cz + d
                const P = [
                        [x0, y0, z0],
                        [x1, y0, z0],
                        [x1, y1, z0],
                        [x0, y1, z0],
                        [x0, y0, z1],
                        [x1, y0, z1],
                        [x1, y1, z1],
                        [x0, y1, z1],
                ] as any
                const F = [
                        [0, 1, 2, 3],
                        [5, 4, 7, 6],
                        [4, 0, 3, 7],
                        [1, 5, 6, 2],
                        [3, 2, 6, 7],
                        [4, 5, 1, 0],
                ]
                for (const f of F) {
                        const [a, b, c, d] = f
                        const uv = [
                                [0, 0],
                                [1, 0],
                                [1, 1],
                                [0, 1],
                        ]
                        tris.push({ v0: P[a], v1: P[b], v2: P[c], uv0: uv[0], uv1: uv[1], uv2: uv[2], mat: 0 })
                        tris.push({ v0: P[a], v1: P[c], v2: P[d], uv0: uv[0], uv1: uv[2], uv2: uv[3], mat: 0 })
                }
        }
        for (const b of boxes) pushBox(b[0], b[1], b[2], b[3], b[4], b[5])
        const mats = [{ base: [0.8, 0.8, 0.85, 1], tex: undefined }]
        const texs: any[] = []
        const min = [0, 0, 0],
                max = [40, 20, 40]
        const extent = [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
        const center = [20, 10, 20]
        return { tris, materials: mats, textures: texs, aabb: { min, max }, model: { extent, center } }
}

export const useVoxelWorld = (client: any, region?: { lat: number; lng: number; zoom: number }) => {
        const glb = useSearchParam('glb')
        const cnt = useFetch<{ count: number }>('chunks', () => client.api.v1.chunks.$get()).data as any
        const should = cnt && typeof cnt.count === 'number' && cnt.count === 0
        const useRegion = region && !glb
        const key = should ? (useRegion ? ['vox-3d', region.lat, region.lng, region.zoom] : ['vox', glb || 'demo']) : null

        const swr = useSWR<{ atlas: Atlas; mesh: Meshes }>(
                key,
                async () => {
                        if (useRegion && region) {
                                const query = { lat: region.lat, lng: region.lng, zoom: String(region.zoom) }
                                const exists = await client.api.v1.atlas.exists.$get({ query: { lat: String(query.lat), lng: String(query.lng), zoom: String(query.zoom) } })
                                if (exists.ok) {
                                        const res = await client.api.v1.atlas.$get({ query: { lat: String(query.lat), lng: String(query.lng), zoom: String(query.zoom) } })
                                        const ab = await res.arrayBuffer()
                                        const voxMap = await extractVoxelArraysFromWorldPNG(ab)
                                        const chunksMap = createChunks() as any
                                        for (const [k, rgba] of voxMap) {
                                                const [i, j, l] = k.split('.').map((v: string) => parseInt(v) | 0)
                                                const id = chunkId(i, j, l)
                                                const chunk = chunksMap.get(id)
                                                if (!chunk) continue
                                                const out = new Uint8Array(16 * 16 * 16)
                                                for (let t = 0, v = 3; t < out.length; t++, v += 4) out[t] = rgba[v] > 0 ? 1 : 0
                                                chunk.vox.set(out)
                                                chunk.dirty = true
                                                chunk.gen = true
                                        }
                                        const m = gather(chunksMap)
                                        const url = `/api/v1/atlas?lat=${query.lat}&lng=${query.lng}&zoom=${query.zoom}`
                                        return { atlas: { src: url, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }, mesh: { pos: m.pos, scl: m.scl, cnt: m.cnt, vertex: [], normal: [] } }
                                }
                                const assetId = 96188
                                const voxRes = await client.api.v1.tiles.cesium[':assetId'].voxelize.$post({ param: { assetId: String(assetId) }, json: { size: 16 } as any })
                                const meta = (await voxRes.json()) as any
                                const url = meta.atlasUrl as string
                                const ab = await fetch(url).then((r) => r.arrayBuffer())
                                const voxMap = await extractVoxelArraysFromWorldPNG(ab)
                                const chunksMap = createChunks() as any
                                for (const [k, rgba] of voxMap) {
                                        const [i, j, l] = k.split('.').map((v: string) => parseInt(v) | 0)
                                        const id = chunkId(i, j, l)
                                        const chunk = chunksMap.get(id)
                                        if (!chunk) continue
                                        const out = new Uint8Array(16 * 16 * 16)
                                        for (let t = 0, v = 3; t < out.length; t++, v += 4) out[t] = rgba[v] > 0 ? 1 : 0
                                        chunk.vox.set(out)
                                        chunk.dirty = true
                                        chunk.gen = true
                                }
                                const m = gather(chunksMap)
                                await client.api.v1.atlas.$put({ query: { lat: String(query.lat), lng: String(query.lng), zoom: String(query.zoom) }, body: new Uint8Array(await (await fetch(url)).arrayBuffer()) as any, headers: { 'content-type': 'image/png' } as any })
                                return { atlas: { src: url, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }, mesh: { pos: m.pos, scl: m.scl, cnt: m.cnt, vertex: [], normal: [] } }
                        }

                        // Default demo voxelization
                        const wasm: any = await importWasm()
                        const parsed = makeDemoParsed()
                        const arr = wasm.voxelize_glb(parsed, 16, 16, 16) as any
                        const chunks = Array.from(arr).map((o: any) => ({ key: o.key as string, rgba: new Uint8Array(o.rgba as any) }))
                        const atlasRGBA = new Uint8Array(4096 * 4096 * 4)
                        for (const c of chunks) {
                                const [ci, cj, ck] = c.key.split('.').map((v: string) => parseInt(v) | 0)
                                blitChunk64ToWorld(c.rgba, ci, cj, ck, atlasRGBA)
                        }
                        const png = await encodeImagePNG(atlasRGBA, 4096, 4096)
                        const url = URL.createObjectURL(new Blob([png], { type: 'image/png' }))
                        const built = { file: { key: 'atlas.png', data: png, raw: atlasRGBA }, dims: { size: [256, 256, 256], center: [128, 128, 128] } } as any
                        const chunksMap = createChunks() as any
                        await applyVoxelDataToChunks(chunksMap, built)
                        const m = gather(chunksMap)
                        return { atlas: { src: url, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }, mesh: { pos: m.pos, scl: m.scl, cnt: m.cnt, vertex: [], normal: [] } }
                },
                { revalidateOnFocus: false, revalidateOnReconnect: false, refreshInterval: 0, shouldRetryOnError: false }
        )
        console.log(swr)
        return swr.data
}
