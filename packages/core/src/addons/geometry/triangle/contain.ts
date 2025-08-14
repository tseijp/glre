import { Fn, Bool, Vec3, cross, dot } from '../../../node'
import { TriangleType } from './triangle'

export const triangleContain = Fn(([tri, pos]: [TriangleType, Vec3]): Bool => {
        const localA = tri.a.sub(pos).toVar('localA')
        const localB = tri.b.sub(pos).toVar('localB')
        const localC = tri.c.sub(pos).toVar('localC')
        const u = cross(localB, localC).toVar('u')
        const v = cross(localC, localA).toVar('v')
        const w = cross(localA, localB).toVar('w')
        return dot(u, v).greaterThanEqual(0).and(dot(u, w).greaterThanEqual(0))
}).setLayout({
        name: 'triangleContain',
        type: 'bool',
        inputs: [
                { name: 'tri', type: 'auto' },
                { name: 'pos', type: 'vec3' },
        ],
})
