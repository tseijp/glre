import { Fn, Bool, Vec3, cross, dot } from '../../../node'

export const triangleContain = Fn(([a, b, c, pos]: [Vec3, Vec3, Vec3, Vec3]): Bool => {
        const localA = a.sub(pos).toVar('localA')
        const localB = b.sub(pos).toVar('localB')
        const localC = c.sub(pos).toVar('localC')
        const u = cross(localB, localC).toVar('u')
        const v = cross(localC, localA).toVar('v')
        const w = cross(localA, localB).toVar('w')
        return dot(u, v).greaterThanEqual(0).and(dot(u, w).greaterThanEqual(0))
}).setLayout({
        name: 'triangleContain',
        type: 'bool',
        inputs: [
                { name: 'a', type: 'vec3' },
                { name: 'b', type: 'vec3' },
                { name: 'c', type: 'vec3' },
                { name: 'pos', type: 'vec3' },
        ],
})

export const contain = triangleContain
