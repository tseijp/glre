import { vec3 } from 'gl-matrix'
import { Chunks, located } from '../utils'

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
