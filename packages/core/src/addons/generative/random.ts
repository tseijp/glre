import { Fn, Float, Vec2, Vec3, Vec4, vec2, vec3, vec4, float, dot, fract, sin } from '../../node'

const RANDOM_SCALE = vec4(443.897, 441.423, 0.0973, 0.1099)

export const randomFloat = Fn(([x]: [Float]): Float => {
        return fract(sin(x).mul(43758.5453))
}).setLayout({
        name: 'randomFloat',
        type: 'float',
        inputs: [{ name: 'x', type: 'float' }],
})

export const randomVec2 = Fn(([st]: [Vec2]): Float => {
        return fract(sin(dot(st, vec2(12.9898, 78.233))).mul(43758.5453))
}).setLayout({
        name: 'randomVec2',
        type: 'float',
        inputs: [{ name: 'st', type: 'vec2' }],
})

export const randomVec3 = Fn(([pos]: [Vec3]): Float => {
        return fract(sin(dot(pos, vec3(70.9898, 78.233, 32.4355))).mul(43758.5453123))
}).setLayout({
        name: 'randomVec3',
        type: 'float',
        inputs: [{ name: 'pos', type: 'vec3' }],
})

export const randomVec4 = Fn(([pos]: [Vec4]): Float => {
        const dot_product = dot(pos, vec4(12.9898, 78.233, 45.164, 94.673)).toVar('dot_product')
        return fract(sin(dot_product).mul(43758.5453))
}).setLayout({
        name: 'randomVec4',
        type: 'float',
        inputs: [{ name: 'pos', type: 'vec4' }],
})

export const random2Float = Fn(([p]: [Float]): Vec2 => {
        const p3 = fract(vec3(p).mul(RANDOM_SCALE.xyz)).toVar('p3')
        p3.addAssign(dot(p3, p3.yzx.add(19.19)))
        return fract(p3.xx.add(p3.yz).mul(p3.zy))
}).setLayout({
        name: 'random2Float',
        type: 'vec2',
        inputs: [{ name: 'p', type: 'float' }],
})

export const random2Vec2 = Fn(([p]: [Vec2]): Vec2 => {
        const p3 = fract(p.xyx.mul(RANDOM_SCALE.xyz)).toVar('p3')
        p3.addAssign(dot(p3, p3.yzx.add(19.19)))
        return fract(p3.xx.add(p3.yz).mul(p3.zy))
}).setLayout({
        name: 'random2Vec2',
        type: 'vec2',
        inputs: [{ name: 'p', type: 'vec2' }],
})

export const random2Vec3 = Fn(([p3]: [Vec3]): Vec2 => {
        p3.assign(fract(p3.mul(RANDOM_SCALE.xyz)))
        p3.addAssign(dot(p3, p3.yzx.add(19.19)))
        return fract(p3.xx.add(p3.yz).mul(p3.zy))
}).setLayout({
        name: 'random2Vec3',
        type: 'vec2',
        inputs: [{ name: 'p3', type: 'vec3' }],
})

export const random3Float = Fn(([p]: [Float]): Vec3 => {
        const p3 = fract(vec3(p).mul(RANDOM_SCALE.xyz)).toVar('p3')
        p3.addAssign(dot(p3, p3.yzx.add(19.19)))
        return fract(p3.xxy.add(p3.yzz).mul(p3.zyx))
}).setLayout({
        name: 'random3Float',
        type: 'vec3',
        inputs: [{ name: 'p', type: 'float' }],
})

export const random3Vec2 = Fn(([p]: [Vec2]): Vec3 => {
        const p3 = fract(vec3(p.xyx).mul(RANDOM_SCALE.xyz)).toVar('p3')
        p3.addAssign(dot(p3, p3.yxz.add(19.19)))
        return fract(p3.xxy.add(p3.yzz).mul(p3.zyx))
}).setLayout({
        name: 'random3Vec2',
        type: 'vec3',
        inputs: [{ name: 'p', type: 'vec2' }],
})

export const random3Vec3 = Fn(([p]: [Vec3]): Vec3 => {
        p.assign(fract(p.mul(RANDOM_SCALE.xyz)))
        p.addAssign(dot(p, p.yxz.add(19.19)))
        return fract(p.xxy.add(p.yzz).mul(p.zyx))
}).setLayout({
        name: 'random3Vec3',
        type: 'vec3',
        inputs: [{ name: 'p', type: 'vec3' }],
})

export const random4Float = Fn(([p]: [Float]): Vec4 => {
        const p4 = fract(float(p).mul(RANDOM_SCALE)).toVar('p4')
        p4.addAssign(dot(p4, p4.wzxy.add(19.19)))
        return fract(p4.xxyz.add(p4.yzzw).mul(p4.zywx))
}).setLayout({
        name: 'random4Float',
        type: 'vec4',
        inputs: [{ name: 'p', type: 'float' }],
})

export const random4Vec2 = Fn(([p]: [Vec2]): Vec4 => {
        const p4 = fract(p.xyxy.mul(RANDOM_SCALE)).toVar('p4')
        p4.addAssign(dot(p4, p4.wzxy.add(19.19)))
        return fract(p4.xxyz.add(p4.yzzw).mul(p4.zywx))
}).setLayout({
        name: 'random4Vec2',
        type: 'vec4',
        inputs: [{ name: 'p', type: 'vec2' }],
})

export const random4Vec3 = Fn(([p]: [Vec3]): Vec4 => {
        const p4 = fract(p.xyzx.mul(RANDOM_SCALE)).toVar('p4')
        p4.addAssign(dot(p4, p4.wzxy.add(19.19)))
        return fract(p4.xxyz.add(p4.yzzw).mul(p4.zywx))
}).setLayout({
        name: 'random4Vec3',
        type: 'vec4',
        inputs: [{ name: 'p', type: 'vec3' }],
})

export const random4Vec4 = Fn(([p4]: [Vec4]): Vec4 => {
        p4.assign(fract(p4.mul(RANDOM_SCALE)))
        p4.addAssign(dot(p4, p4.wzxy.add(19.19)))
        return fract(p4.xxyz.add(p4.yzzw).mul(p4.zywx))
}).setLayout({
        name: 'random4Vec4',
        type: 'vec4',
        inputs: [{ name: 'p4', type: 'vec4' }],
})
