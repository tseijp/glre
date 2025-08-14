import { Fn, Vec3 } from '../../../node'
import { TriangleType } from './triangle'

export const triangleCentroid = Fn(([tri]: [TriangleType]): Vec3 => {
        return tri.a.add(tri.b).add(tri.c).div(3)
}).setLayout({
        name: 'triangleCentroid',
        type: 'vec3',
        inputs: [{ name: 'tri', type: 'auto' }],
})
