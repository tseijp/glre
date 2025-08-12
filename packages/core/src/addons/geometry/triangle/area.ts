import { Fn, Float, length, cross, Vec3 } from '../../../node'

export const area = Fn(([a, b, c]: [Vec3, Vec3, Vec3]): Float => {
        return length(cross(b.sub(a), c.sub(a))).mul(0.5)
}).setLayout({
        name: 'area',
        type: 'float',
        inputs: [
                { name: 'a', type: 'vec3' },
                { name: 'b', type: 'vec3' },
                { name: 'c', type: 'vec3' },
        ],
})
