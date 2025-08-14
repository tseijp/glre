import { Fn, Vec3, cross, normalize } from '../../../node'
import { TriangleType } from './triangle'

export const normal = Fn(([tri]: [TriangleType]): Vec3 => {
        return normalize(cross(tri.b.sub(tri.a), tri.c.sub(tri.a)))
}).setLayout({
        name: 'normal',
        type: 'vec3',
        inputs: [
                { name: 'tri', type: 'auto' },
        ],
})
