import { Fn, Float, Vec2, Vec3, Vec4, X } from '../../node'
import { mod289, mod289Vec2, mod289Vec3, mod289Vec4 } from './mod289'

// Core permutation operation - reusable implementation
const fun = (v: X): X => {
        return v.mul(34.0).add(1.0).mul(v)
}

// Float variant
export const permute = Fn(([v]: [Float]): Float => {
        return mod289(fun(v) as Float)
}).setLayout({
        name: 'permute',
        type: 'float',
        inputs: [{ name: 'v', type: 'float' }],
})

// Vec2 variant
export const permuteVec2 = Fn(([v]: [Vec2]): Vec2 => {
        return mod289Vec2(fun(v) as Vec2)
}).setLayout({
        name: 'permuteVec2',
        type: 'vec2',
        inputs: [{ name: 'v', type: 'vec2' }],
})

// Vec3 variant
export const permuteVec3 = Fn(([v]: [Vec3]): Vec3 => {
        return mod289Vec3(fun(v) as Vec3)
}).setLayout({
        name: 'permuteVec3',
        type: 'vec3',
        inputs: [{ name: 'v', type: 'vec3' }],
})

// Vec4 variant
export const permuteVec4 = Fn(([v]: [Vec4]): Vec4 => {
        return mod289Vec4(fun(v) as Vec4)
}).setLayout({
        name: 'permuteVec4',
        type: 'vec4',
        inputs: [{ name: 'v', type: 'vec4' }],
})
