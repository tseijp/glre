import { Fn, Float, Vec2, Vec3, Vec4, X } from '../../node'

// Core mod289 operation - reusable implementation
const mod289Core = (x: X): X => {
        return x.sub(
                x
                        .mul(1.0 / 289.0)
                        .floor()
                        .mul(289.0)
        )
}

// Float variant
export const mod289 = Fn(([x]: [Float]): Float => {
        return mod289Core(x) as Float
}).setLayout({
        name: 'mod289',
        type: 'float',
        inputs: [{ name: 'x', type: 'float' }],
})

// Vec2 variant
export const mod289Vec2 = Fn(([x]: [Vec2]): Vec2 => {
        return mod289Core(x) as Vec2
}).setLayout({
        name: 'mod289Vec2',
        type: 'vec2',
        inputs: [{ name: 'x', type: 'vec2' }],
})

// Vec3 variant
export const mod289Vec3 = Fn(([x]: [Vec3]): Vec3 => {
        return mod289Core(x) as Vec3
}).setLayout({
        name: 'mod289Vec3',
        type: 'vec3',
        inputs: [{ name: 'x', type: 'vec3' }],
})

// Vec4 variant
export const mod289Vec4 = Fn(([x]: [Vec4]): Vec4 => {
        return mod289Core(x) as Vec4
}).setLayout({
        name: 'mod289Vec4',
        type: 'vec4',
        inputs: [{ name: 'x', type: 'vec4' }],
})
