import { Fn, Vec2, Vec3, Vec4, Float, min } from '../../node'

// Multi-component minimum for vec2
export const mmin2 = Fn(([v]: [Vec2]): Float => {
        return min(v.x, v.y)
}).setLayout({
        name: 'mmin',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec2' }],
})

// Multi-component minimum for vec3
export const mmin3 = Fn(([v]: [Vec3]): Float => {
        return min(v.x, min(v.y, v.z))
}).setLayout({
        name: 'mmin',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec3' }],
})

// Multi-component minimum for vec4
export const mmin4 = Fn(([v]: [Vec4]): Float => {
        return min(min(v.x, v.y), min(v.z, v.w))
}).setLayout({
        name: 'mmin',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec4' }],
})

// Generic mmin function - delegates to specific implementations
export const mmin = mmin4
