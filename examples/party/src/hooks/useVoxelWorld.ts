import useSWR from 'swr'
import { blitChunk64ToWorld, chunkId, createChunks, encodeImagePNG, extractVoxelArraysFromWorldPNG, gather, importWasm, meshing, loader, loadCesiumModel } from '../helpers'
import { useSearchParam } from './useSearchParam'
import type { Atlas, Meshes } from '../helpers'

export const useVoxelWorld = (client: any, region?: { lat: number; lng: number; zoom: number }) => {
        const glb = useSearchParam('glb')
        const asset = useSearchParam('asset')
        const assetId = asset ? parseInt(asset) : 96188
        const useRegion = region && !glb
        const key = useRegion ? ['vox-glb', region.lat, region.lng, region.zoom, assetId] : ['vox', glb || 'demo']

        const fillChunks = (voxMap: Map<string, Uint8Array>) => {
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
                return m
        }

        const swr = useSWR<{ atlas: Atlas; mesh: Meshes }>(
                key,
                async () => {
                        if (!region) return undefined as any
                        const { lat, lng, zoom } = region
                        const q = `/api/v1/atlas?lat=${lat}&lng=${lng}&zoom=${zoom}`

                        // ↓↓↓ TEMPORARY COMMENT OUTED (DO NOT CHANGE) ↓↓↓
                        // const head = await fetch(q, { method: 'HEAD' })
                        // if (head.ok) {
                        //         const res = await client.api.v1.atlas.$get({ query: { lat: String(lat), lng: String(lng), zoom: String(zoom) } })
                        //         const ab = await res.arrayBuffer()
                        //         const voxMap = await extractVoxelArraysFromWorldPNG(ab)
                        //         const m = fillChunks(voxMap)
                        //         return { atlas: { src: q, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }, mesh: { pos: m.pos, scl: m.scl, cnt: m.cnt, vertex: [], normal: [] } }
                        // }
                        // ↑↑ TEMPORARY COMMENT OUTED (DO NOT CHANGE) ↑↑↑

                        const wasm: any = await importWasm()
                        const res = await client.api.v1.cesium[':assetId'].$get({ param: { assetId: String(assetId) } })
                        if (!res.ok) throw Error(`Error: client.api.v1.cesium[':assetId'].$get is not ok`)
                        const glbBuf = await res.arrayBuffer()
                        const parsed = await loader(glbBuf)
                        const items = Array.from(wasm.voxelize_glb(parsed, 16, 16, 16) || []) as any[]
                        const atlasRGBA = new Uint8Array(4096 * 4096 * 4)
                        for (const it of items) {
                                const [ci, cj, ck] = String(it.key)
                                        .split('.')
                                        .map((v: string) => parseInt(v) | 0)
                                blitChunk64ToWorld(new Uint8Array(it.rgba as any), ci, cj, ck, atlasRGBA)
                        }
                        const png = await encodeImagePNG(atlasRGBA, 4096, 4096)
                        const voxMap = await extractVoxelArraysFromWorldPNG(png.buffer)
                        const m = fillChunks(voxMap)

                        // ↓↓↓ TEMPORARY COMMENT OUTED (DO NOT CHANGE) ↓↓↓
                        // fetch(q, { method: 'PUT', body: png }).catch(() => {})
                        // ↑↑ TEMPORARY COMMENT OUTED (DO NOT CHANGE) ↑↑↑

                        const url = URL.createObjectURL(new Blob([png], { type: 'image/png' }))
                        return { atlas: { src: url, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }, mesh: { pos: m.pos, scl: m.scl, cnt: m.cnt, vertex: [], normal: [] } }
                },
                { revalidateOnFocus: false, revalidateOnReconnect: false, refreshInterval: 0, shouldRetryOnError: false }
        )
        // ↓↓↓ (DO NOT CHANGE) ↓↓↓
        console.log(swr.data)
        // ↑↑ (DO NOT CHANGE) ↑↑↑
        return swr.data
}
