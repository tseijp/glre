import { Fn, Vec3 } from '../../../node'

export const centroid = Fn(([a, b, c]: [Vec3, Vec3, Vec3]): Vec3 => {
        return a.add(b).add(c).div(3)
}).setLayout({
        name: 'triangleCentroid',
        type: 'vec3',
        inputs: [
                { name: 'a', type: 'vec3' },
                { name: 'b', type: 'vec3' },
                { name: 'c', type: 'vec3' },
        ],
})
