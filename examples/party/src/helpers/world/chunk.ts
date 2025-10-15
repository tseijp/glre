import { greedyMesh } from './greedy'
// import { culling } from './culling'
import { CHUNK, chunkId, eachChunk, located, SIZE } from '../utils'
import type { Chunk, Chunks } from '../types'

export const createChunks = () => {
        const chunks = new Map()
        eachChunk((i, j, k) => {
                const vox = new Uint8Array(SIZE)
                const id = chunkId(i, j, k)
                const x = i * CHUNK
                const y = j * CHUNK
                const z = k * CHUNK
                chunks.set(id, { i, j, k, x, y, z, vox, pos: [], scl: [], cnt: 0, dirty: false, visible: false, gen: false })
        })
        return chunks
}

const _meshing = (chunk: Chunk) => {
        if (!chunk.visible) return
        if (!chunk.dirty) return
        const m = greedyMesh(chunk.vox, CHUNK)
        for (let i = 0; i < m.cnt; i++) {
                const j = i * 3
                m.pos[j] += chunk.x + Math.random() / 100
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
