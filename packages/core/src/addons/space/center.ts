import { Fn, Float, Vec2, Vec3 } from '../../node'

function center(x: Float): Float
function center(v: Vec2): Vec2
function center(v: Vec3): Vec3
function center(v: any): any {
        return v.mul(2).sub(1)
}

export const centerFloat = Fn(([x]: [Float]): Float => {
        return center(x)
}).setLayout({
        name: 'centerFloat',
        type: 'float',
        inputs: [{ name: 'x', type: 'float' }],
})

export const centerVec2 = Fn(([v]: [Vec2]): Vec2 => {
        return center(v)
}).setLayout({
        name: 'centerVec2',
        type: 'vec2',
        inputs: [{ name: 'v', type: 'vec2' }],
})

export const centerVec3 = Fn(([v]: [Vec3]): Vec3 => {
        return center(v)
}).setLayout({
        name: 'centerVec3',
        type: 'vec3',
        inputs: [{ name: 'v', type: 'vec3' }],
})
