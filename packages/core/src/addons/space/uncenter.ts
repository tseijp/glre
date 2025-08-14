import { Fn, Float, Vec2, Vec3 } from '../../node'

function uncenter(x: Float): Float
function uncenter(v: Vec2): Vec2
function uncenter(v: Vec3): Vec3
function uncenter(v: any): any {
        return v.mul(0.5).add(0.5)
}

export const uncenterFloat = Fn(([x]: [Float]): Float => {
        return uncenter(x)
}).setLayout({
        name: 'uncenterFloat',
        type: 'float',
        inputs: [{ name: 'x', type: 'float' }],
})

export const uncenterVec2 = Fn(([v]: [Vec2]): Vec2 => {
        return uncenter(v)
}).setLayout({
        name: 'uncenterVec2',
        type: 'vec2',
        inputs: [{ name: 'v', type: 'vec2' }],
})

export const uncenterVec3 = Fn(([v]: [Vec3]): Vec3 => {
        return uncenter(v)
}).setLayout({
        name: 'uncenterVec3',
        type: 'vec3',
        inputs: [{ name: 'v', type: 'vec3' }],
})
