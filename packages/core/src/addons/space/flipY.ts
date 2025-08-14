import { Fn, Vec2, Vec3, Vec4, vec2, vec3, vec4 } from '../../node'

export const flipYVec2 = Fn(([v]: [Vec2]): Vec2 => {
        return vec2(v.x, v.y.oneMinus())
}).setLayout({
        name: 'flipY',
        type: 'vec2',
        inputs: [{ name: 'v', type: 'vec2' }],
})

export const flipYVec3 = Fn(([v]: [Vec3]): Vec3 => {
        return vec3(v.x, v.y.oneMinus(), v.z)
}).setLayout({
        name: 'flipY',
        type: 'vec3',
        inputs: [{ name: 'v', type: 'vec3' }],
})

export const flipYVec4 = Fn(([v]: [Vec4]): Vec4 => {
        return vec4(v.x, v.y.oneMinus(), v.z, v.w)
}).setLayout({
        name: 'flipY',
        type: 'vec4',
        inputs: [{ name: 'v', type: 'vec4' }],
})
