import useSWR from 'swr'
import { useFetch, useSearchParam } from '.'
import { importWasm } from '../helpers/voxel/wasm'
import { loadGLBParsed } from '../helpers/voxel/gltf'
import { buildAtlasAndMesh } from '../helpers/voxel/build'
import type { Atlas, Meshes } from '../helpers/types'

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

export const useVoxelWorld = () => {
        const glb = useSearchParam('glb')
        const cnt = useFetch<{ count: number }>('chunks', () => fetch('/api/v1/chunks').then((r) => r.json() as any)).data as any
        const should = cnt && typeof cnt.count === 'number' && cnt.count === 0
        const key = should ? ['vox', glb || 'demo'] : null
        const swr = useSWR<{ atlas: Atlas; mesh: Meshes }>(key, async () => {
                const wasm: any = await importWasm()
                const parsed = glb ? await loadGLBParsed(glb) : makeDemoParsed()
                const arr = wasm.voxelize_glb(parsed, 16, 16, 16) as any
                const chunks = Array.from(arr).map((o: any) => ({ key: o.key as string, rgba: new Uint8Array(o.rgba as any) }))
                const built = await buildAtlasAndMesh(chunks)
                return built
        })
        return swr.data
}
