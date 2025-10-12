import useSWR from 'swr'
import { useSearchParam } from '.'
import { importWasm } from '../helpers/utils'
import type { Atlas, Meshes } from '../helpers/types'
import { blitChunk64ToWorld, encodeImagePNG, extractVoxelArraysFromWorldPNG } from '../helpers/world/atlas'
import { createChunks, gather, meshing } from '../helpers/world/chunk'
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
                ]
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
        const useRegion = region && !glb
        const key = useRegion ? ['vox-3d', region.lat, region.lng, region.zoom] : ['vox', glb || 'demo']

        const swr = useSWR<{ atlas: Atlas; mesh: Meshes }>(
                key,
                async () => {
                        if (!region) return undefined as any
                        const query = { lat: region.lat, lng: region.lng, zoom: String(region.zoom) }
                        const head = await fetch(`/api/v1/atlas?lat=${query.lat}&lng=${query.lng}&zoom=${query.zoom}`, { method: 'HEAD' })
                        if (head.ok) {
                                const res = await client.api.v1.atlas.$get({ query: { lat: String(query.lat), lng: String(query.lng), zoom: String(query.zoom) } })
                                const isPNG = String(res.headers.get('content-type') || '').includes('image/png')
                                if (isPNG) {
                                        const ab = await res.arrayBuffer()
                                        if (ab && ab.byteLength > 0) {
                                                const voxMap = await extractVoxelArraysFromWorldPNG(ab)
                                                if (voxMap.size > 0) {
                                                        const chunksMap = createChunks() as any
                                                        for (const [k, rgba] of voxMap) {
                                                                const [i, j, l] = k.split('.').map((v: string) => parseInt(v) | 0)
                                                                const id = chunkId(i, j, l)
                                                                const chunk = chunksMap.get(id)
                                                                if (!chunk) continue
                                                                const out = new Uint8Array(16 * 16 * 16)
                                                                for (let t = 0, v = 3; t < out.length; t++, v += 4) out[t] = rgba[v] > 0 ? 1 : 0
                                                                chunk.vox.set(out)
                                                                chunk.visible = true
                                                                chunk.dirty = true
                                                                chunk.gen = true
                                                        }
                                                        meshing(chunksMap)
                                                        const m = gather(chunksMap)
                                                        const url = `/api/v1/atlas?lat=${query.lat}&lng=${query.lng}&zoom=${query.zoom}`
                                                        return { atlas: { src: url, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }, mesh: { pos: m.pos, scl: m.scl, cnt: m.cnt, vertex: [], normal: [] } }
                                                }
                                        }
                                }
                        }
                        const assetId = 96188
                        const glbRes = await client.api.v1.tiles.cesium[':assetId'].gltf.$get({ param: { assetId: String(assetId) } })
                        const _ab = await glbRes.arrayBuffer()
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
                        await client.api.v1.atlas.$put({ query: { lat: String(query.lat), lng: String(query.lng), zoom: String(query.zoom) }, body: png as any, headers: { 'content-type': 'image/png' } as any })
                        const voxMap = await extractVoxelArraysFromWorldPNG(png.buffer)
                        const chunksMap = createChunks() as any
                        for (const [k, rgba] of voxMap) {
                                const [i, j, l] = k.split('.').map((v: string) => parseInt(v) | 0)
                                const id = chunkId(i, j, l)
                                const chunk = chunksMap.get(id)
                                if (!chunk) continue
                                const out = new Uint8Array(16 * 16 * 16)
                                for (let t = 0, v = 3; t < out.length; t++, v += 4) out[t] = rgba[v] > 0 ? 1 : 0
                                chunk.vox.set(out)
                                chunk.visible = true
                                chunk.dirty = true
                                chunk.gen = true
                        }
                        meshing(chunksMap)
                        const m = gather(chunksMap)
                        const objUrl = URL.createObjectURL(new Blob([png], { type: 'image/png' }))
                        return { atlas: { src: objUrl, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }, mesh: { pos: m.pos, scl: m.scl, cnt: m.cnt, vertex: [], normal: [] } }
                },
                { revalidateOnFocus: false, revalidateOnReconnect: false, refreshInterval: 0, shouldRetryOnError: false }
        )
        // ↓↓↓ DO NOT REMOVE↓↓↓
        console.log(swr.data)
        return swr.data
}
