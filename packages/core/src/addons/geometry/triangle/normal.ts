import { Fn, Vec3, cross, normalize } from '../../../node'

export const triangleNormal = Fn(([a, b, c]: [Vec3, Vec3, Vec3]): Vec3 => {
        return normalize(cross(b.sub(a), c.sub(a)))
}).setLayout({
        name: 'triangleNormal',
        type: 'vec3',
        inputs: [
                { name: 'a', type: 'vec3' },
                { name: 'b', type: 'vec3' },
                { name: 'c', type: 'vec3' },
        ],
})

export const normal = triangleNormal
