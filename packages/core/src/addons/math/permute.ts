import { Fn, Float, Vec2, Vec3, Vec4, X } from '../../node'
import { mod289, mod289Vec2, mod289Vec3, mod289Vec4 } from './mod289'

function fun(v: Float): Float
function fun(v: Vec2): Vec2
function fun(v: Vec3): Vec3
function fun(v: Vec4): Vec4
function fun(v: X): X {
        return v.mul(34.0).add(1.0).mul(v)
}

export const permute = Fn(([v]: [Float]): Float => {
        return mod289(fun(v))
}).setLayout({
        name: 'permute',
        type: 'float',
        inputs: [{ name: 'v', type: 'float' }],
})

export const permuteVec2 = Fn(([v]: [Vec2]): Vec2 => {
        return mod289Vec2(fun(v))
}).setLayout({
        name: 'permuteVec2',
        type: 'vec2',
        inputs: [{ name: 'v', type: 'vec2' }],
})

export const permuteVec3 = Fn(([v]: [Vec3]): Vec3 => {
        return mod289Vec3(fun(v))
}).setLayout({
        name: 'permuteVec3',
        type: 'vec3',
        inputs: [{ name: 'v', type: 'vec3' }],
})

export const permuteVec4 = Fn(([v]: [Vec4]): Vec4 => {
        return mod289Vec4(fun(v))
}).setLayout({
        name: 'permuteVec4',
        type: 'vec4',
        inputs: [{ name: 'v', type: 'vec4' }],
})
