import { greedyMesh } from './greedy'
// import { culling } from './culling'
import { Camera } from '../player/camera'
import { CHUNK, Chunk, chunkId, Chunks, eachChunk, located, SIZE } from '../utils'
import { loadRegionTiles, voxelizeRegionTiles, getCachedRegion, estimateRegionBounds } from '../voxel/tiles'
import type { RegionConfig } from '../voxel/tiles'
import type { BuiltState } from '../types'

export const createChunks = () => {
        const ret = new Map()
        eachChunk((i, j, k) => {
                const vox = new Uint8Array(SIZE)
                const id = chunkId(i, j, k)
                const x = i * CHUNK
                const y = j * CHUNK
                const z = k * CHUNK
                ret.set(id, { i, j, k, x, y, z, vox, pos: [], scl: [], cnt: 0, dirty: false, visible: false, gen: false })
        })
        return ret
}

const _meshing = (chunk: Chunk) => {
        if (!chunk.visible) return
        if (!chunk.dirty) return
        const m = greedyMesh(chunk.vox, CHUNK)
        for (let i = 0; i < m.cnt; i++) {
                const j = i * 3
                m.pos[j] += chunk.x
                m.pos[j + 1] += chunk.y
                m.pos[j + 2] += chunk.z
        }
        chunk.pos = m.pos
        chunk.scl = m.scl
        chunk.cnt = m.cnt
        chunk.dirty = false
}

export const meshing = (chunks: Chunks) => chunks.forEach(_meshing)

export const write = (chunks: Chunks, x = 0, y = 0, z = 0, t = 1) => {
        const loc = located(x, y, z)
        const chunk = chunks.get(loc.chunkId)
        if (!chunk) return
        chunk.vox[loc.localId] = t
        chunk.dirty = true
        _meshing(chunk)
}

export const gather = (chunks: Map<number, Chunk>) => {
        const pos: number[] = [0, 0, 0]
        const scl: number[] = [0, 0, 0]
        let cnt = 1
        chunks.forEach((c) => {
                if (!c.visible) return
                if (!c.cnt) return
                pos.push(...c.pos)
                scl.push(...c.scl)
                cnt += c.cnt
        })
        return { pos, scl, cnt }
}

export const generate = (_camera: Camera) => {
        const chunks = createChunks()
        meshing(chunks)
        // @TODO culling
        return chunks
}

const extractChunkFromAtlas = (worldData: Uint8Array, ci: number, cj: number, ck: number, worldSize: number[]): Uint8Array | null => {
        // Extract 16x16x16 chunk from world atlas
        const chunkVox = new Uint8Array(16 * 16 * 16)
        // Calculate world coordinates
        const worldX = ci * 16
        const worldY = cj * 16
        const worldZ = ck * 16
        if (worldX >= worldSize[0] || worldY >= worldSize[1] || worldZ >= worldSize[2]) return null
        // Extract voxel data from atlas using same pattern as atlas.ts
        for (let z = 0; z < 16; z++) {
                const oz = (z & 3) * 16
                const pz = (z >> 2) * 16
                for (let y = 0; y < 16; y++) {
                        for (let x = 0; x < 16; x++) {
                                const wx = worldX + x
                                const wy = worldY + y
                                const wz = worldZ + z
                                if (wx < worldSize[0] && wy < worldSize[1] && wz < worldSize[2]) {
                                        // Calculate atlas position
                                        const atlasX = (cj % 4) * 64 + (oz + x)
                                        const atlasY = Math.floor(cj / 4) * 64 + (pz + y)
                                        const atlasIdx = (atlasY * 4096 + atlasX) * 4 + 3 // Alpha channel
                                        const voxelIdx = x + (y + z * 16) * 16
                                        chunkVox[voxelIdx] = worldData[atlasIdx] > 0 ? 1 : 0
                                }
                        }
                }
        }

        return chunkVox
}

export const applyVoxelDataToChunks = async (chunks: Chunks, voxelData: BuiltState): Promise<void> => {
        if (typeof voxelData.file === 'string' || !voxelData.file?.raw) return
        const worldData = voxelData.file.raw
        const { size } = voxelData.dims
        chunks.forEach((chunk) => {
                const { i, j, k } = chunk
                const chunkData = extractChunkFromAtlas(worldData, i, j, k, size)
                if (chunkData) {
                        chunk.vox.set(chunkData)
                        chunk.dirty = true
                        chunk.gen = true
                }
        })
}
