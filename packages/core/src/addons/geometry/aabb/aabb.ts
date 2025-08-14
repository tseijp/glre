import { struct, vec3 } from '../../../node'

export const AABB = struct({
        minBounds: vec3(),
        maxBounds: vec3(),
})

export type AABBType = ReturnType<typeof AABB>
