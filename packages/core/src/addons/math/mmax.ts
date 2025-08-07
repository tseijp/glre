import { Fn, Vec2, Vec3, Vec4, Float, max } from '../../node'

export const mmax2 = Fn(([v]: [Vec2]): Float => {
        return max(v.x, v.y)
}).setLayout({
        name: 'mmax',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec2' }],
})

export const mmax3 = Fn(([v]: [Vec3]): Float => {
        return max(v.x, max(v.y, v.z))
}).setLayout({
        name: 'mmax',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec3' }],
})

export const mmax4 = Fn(([v]: [Vec4]): Float => {
        return max(max(v.x, v.y), max(v.z, v.w))
}).setLayout({
        name: 'mmax',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec4' }],
})

export const mmax = mmax4
