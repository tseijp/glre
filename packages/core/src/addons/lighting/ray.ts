import { struct, vec3 } from '../../node'

export const Ray = struct({
        origin: vec3(),
        direction: vec3(),
})

export type RayType = ReturnType<typeof Ray>
