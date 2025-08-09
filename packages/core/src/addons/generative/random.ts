import { Fn, Float, Vec2, Vec3, Vec4, vec2, vec3, vec4, float, dot, fract, sin } from '../../node'

const RANDOM_SCALE = vec4(443.897, 441.423, 0.0973, 0.1099)

export const random = Fn(([x]: [Float]): Float => {
        return x.sin().mul(43758.5453).fract()
}).setLayout({
        name: 'random',
        type: 'float',
        inputs: [{ name: 'x', type: 'float' }],
})

export const randomVec2 = Fn(([st]: [Vec2]): Float => {
        return st.dot(vec2(12.9898, 78.233)).sin().mul(43758.5453).fract()
}).setLayout({
        name: 'randomVec2',
        type: 'float',
        inputs: [{ name: 'st', type: 'vec2' }],
})

export const randomVec3 = Fn(([pos]: [Vec3]): Float => {
        return pos.dot(vec3(70.9898, 78.233, 32.4355)).sin().mul(43758.5453123).fract()
}).setLayout({
        name: 'randomVec3',
        type: 'float',
        inputs: [{ name: 'pos', type: 'vec3' }],
})

export const randomVec4 = Fn(([pos]: [Vec4]): Float => {
        const dot_product = pos.dot(vec4(12.9898, 78.233, 45.164, 94.673)).toVar('dot_product')
        return dot_product.sin().mul(43758.5453).fract()
}).setLayout({
        name: 'randomVec4',
        type: 'float',
        inputs: [{ name: 'pos', type: 'vec4' }],
})

export const random2Float = Fn(([p]: [Float]): Vec2 => {
        const p3 = vec3(p).mul(RANDOM_SCALE.xyz).fract().toVar('p3')
        p3.addAssign(p3.dot(p3.yzx.add(19.19)))
        return p3.xx.add(p3.yz).mul(p3.zy).fract()
}).setLayout({
        name: 'random2Float',
        type: 'vec2',
        inputs: [{ name: 'p', type: 'float' }],
})

export const random2Vec2 = Fn(([p]: [Vec2]): Vec2 => {
        const p3 = p.xyx.mul(RANDOM_SCALE.xyz).fract().toVar('p3')
        p3.addAssign(p3.dot(p3.yzx.add(19.19)))
        return p3.xx.add(p3.yz).mul(p3.zy).fract()
}).setLayout({
        name: 'random2Vec2',
        type: 'vec2',
        inputs: [{ name: 'p', type: 'vec2' }],
})

export const random2Vec3 = Fn(([p3]: [Vec3]): Vec2 => {
        p3.assign(p3.mul(RANDOM_SCALE.xyz).fract())
        p3.addAssign(p3.dot(p3.yzx.add(19.19)))
        return p3.xx.add(p3.yz).mul(p3.zy).fract()
}).setLayout({
        name: 'random2Vec3',
        type: 'vec2',
        inputs: [{ name: 'p3', type: 'vec3' }],
})

export const random3Float = Fn(([p]: [Float]): Vec3 => {
        const p3 = vec3(p).mul(RANDOM_SCALE.xyz).fract().toVar('p3')
        p3.addAssign(p3.dot(p3.yzx.add(19.19)))
        return p3.xxy.add(p3.yzz).mul(p3.zyx).fract()
}).setLayout({
        name: 'random3Float',
        type: 'vec3',
        inputs: [{ name: 'p', type: 'float' }],
})

export const random3Vec2 = Fn(([p]: [Vec2]): Vec3 => {
        const p3 = vec3(p.xyx).mul(RANDOM_SCALE.xyz).fract().toVar('p3')
        p3.addAssign(p3.dot(p3.yxz.add(19.19)))
        return p3.xxy.add(p3.yzz).mul(p3.zyx).fract()
}).setLayout({
        name: 'random3Vec2',
        type: 'vec3',
        inputs: [{ name: 'p', type: 'vec2' }],
})

export const random3Vec3 = Fn(([p]: [Vec3]): Vec3 => {
        p.assign(p.mul(RANDOM_SCALE.xyz).fract())
        p.addAssign(p.dot(p.yxz.add(19.19)))
        return p.xxy.add(p.yzz).mul(p.zyx).fract()
}).setLayout({
        name: 'random3Vec3',
        type: 'vec3',
        inputs: [{ name: 'p', type: 'vec3' }],
})

export const random4Float = Fn(([p]: [Float]): Vec4 => {
        const p4 = float(p).mul(RANDOM_SCALE).fract().toVar('p4')
        p4.addAssign(p4.dot(p4.wzxy.add(19.19)))
        return p4.xxyz.add(p4.yzzw).mul(p4.zywx).fract()
}).setLayout({
        name: 'random4Float',
        type: 'vec4',
        inputs: [{ name: 'p', type: 'float' }],
})

export const random4Vec2 = Fn(([p]: [Vec2]): Vec4 => {
        const p4 = p.xyxy.mul(RANDOM_SCALE).fract().toVar('p4')
        p4.addAssign(p4.dot(p4.wzxy.add(19.19)))
        return p4.xxyz.add(p4.yzzw).mul(p4.zywx).fract()
}).setLayout({
        name: 'random4Vec2',
        type: 'vec4',
        inputs: [{ name: 'p', type: 'vec2' }],
})

export const random4Vec3 = Fn(([p]: [Vec3]): Vec4 => {
        const p4 = p.xyzx.mul(RANDOM_SCALE).fract().toVar('p4')
        p4.addAssign(p4.dot(p4.wzxy.add(19.19)))
        return p4.xxyz.add(p4.yzzw).mul(p4.zywx).fract()
}).setLayout({
        name: 'random4Vec3',
        type: 'vec4',
        inputs: [{ name: 'p', type: 'vec3' }],
})

export const random4Vec4 = Fn(([p4]: [Vec4]): Vec4 => {
        p4.assign(p4.mul(RANDOM_SCALE).fract())
        p4.addAssign(p4.dot(p4.wzxy.add(19.19)))
        return p4.xxyz.add(p4.yzzw).mul(p4.zywx).fract()
}).setLayout({
        name: 'random4Vec4',
        type: 'vec4',
        inputs: [{ name: 'p4', type: 'vec4' }],
})
