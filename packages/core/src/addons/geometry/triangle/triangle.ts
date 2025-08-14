import { struct, vec3 } from '../../../node'

export const Triangle = struct({
        a: vec3(),
        b: vec3(),
        c: vec3(),
})

export type TriangleType = ReturnType<typeof Triangle>
