import { Fn, Float, Vec2, Vec3, Vec4, X } from '../../node'

function fun(x: Float): Float
function fun(x: Vec2): Vec2
function fun(x: Vec3): Vec3
function fun(x: Vec4): Vec4
function fun(x: X): X {
        return x.sub(
                x
                        .mul(1.0 / 289.0)
                        .floor()
                        .mul(289.0)
        )
}

export const mod289 = Fn(([x]: [Float]): Float => {
        return fun(x)
}).setLayout({
        name: 'mod289',
        type: 'float',
        inputs: [{ name: 'x', type: 'float' }],
})

export const mod289Vec2 = Fn(([x]: [Vec2]): Vec2 => {
        return fun(x)
}).setLayout({
        name: 'mod289Vec2',
        type: 'vec2',
        inputs: [{ name: 'x', type: 'vec2' }],
})

export const mod289Vec3 = Fn(([x]: [Vec3]): Vec3 => {
        return fun(x)
}).setLayout({
        name: 'mod289Vec3',
        type: 'vec3',
        inputs: [{ name: 'x', type: 'vec3' }],
})

export const mod289Vec4 = Fn(([x]: [Vec4]): Vec4 => {
        return fun(x)
}).setLayout({
        name: 'mod289Vec4',
        type: 'vec4',
        inputs: [{ name: 'x', type: 'vec4' }],
})
