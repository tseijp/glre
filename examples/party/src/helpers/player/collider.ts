import { vec3 } from 'gl-matrix'
import { located, CHUNK } from '../utils'
import type { Chunks, Region } from '../types'

export type ColliderState = { pos: vec3; vel: vec3; size: vec3; isGround: boolean }

const clampToFace = (p: number, half: number, sign = 0) => {
        const base = Math.floor(p)
        return sign > 0 ? Math.min(p, base + 1 - half) : Math.max(p, base + half)
}

const collide = (chunks: Chunks, state: ColliderState, axis = 0) => {
        const v = state.vel[axis]
        const s = Math.sign(v)
        const x = state.pos[0] + (axis === 0 ? s : 0)
        const y = state.pos[1] + (axis === 1 ? s : 0)
        const z = state.pos[2] + (axis === 2 ? s : 0)
        const loc = located(x, y, z)
        const chunk = chunks.get(loc.chunkId)
        if (!chunk || !chunk.vox[loc.localId]) return
        state.pos[axis] = clampToFace(state.pos[axis], state.size[axis] * 0.5, s)
        state.vel[axis] = 0
        if (axis === 1 && s < 0) state.isGround = true
}

export const collider = (chunks: Chunks, state: ColliderState) => {
        state.isGround = false
        collide(chunks, state, 1)
        collide(chunks, state, 0)
        collide(chunks, state, 2)
}

export const collectNearbyChunks = (regions: Region[], playerPos: vec3, range = 2): Chunks => {
        const nearbyChunks = new Map()
        const playerRegionX = Math.floor(playerPos[0] / (CHUNK * 16))
        const playerRegionZ = Math.floor(playerPos[2] / (CHUNK * 16))
        for (const region of regions) {
                if (!region || !region.visible || !region.chunks) continue
                const regionX = region.x / (CHUNK * 16)
                const regionZ = region.z / (CHUNK * 16)
                const dx = Math.abs(regionX - playerRegionX)
                const dz = Math.abs(regionZ - playerRegionZ)
                if (dx <= 1 && dz <= 1) {
                        for (const [id, chunk] of region.chunks) {
                                const globalChunkX = region.i * 16 + chunk.i
                                const globalChunkY = region.j * 16 + chunk.j
                                const globalChunkZ = region.k * 16 + chunk.k
                                const chunkCenterX = globalChunkX * CHUNK + CHUNK / 2
                                const chunkCenterY = globalChunkY * CHUNK + CHUNK / 2
                                const chunkCenterZ = globalChunkZ * CHUNK + CHUNK / 2
                                const distX = Math.abs(chunkCenterX - playerPos[0])
                                const distY = Math.abs(chunkCenterY - playerPos[1])
                                const distZ = Math.abs(chunkCenterZ - playerPos[2])
                                if (distX <= CHUNK * range && distY <= CHUNK * range && distZ <= CHUNK * range) nearbyChunks.set(id, chunk)
                        }
                }
        }
        return nearbyChunks
}
