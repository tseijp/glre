import { Fn, Vec2, Vec3, Float, mod } from '../../node'

export const opRepeatVec2 = Fn(([p, s]: [Vec2, Float]): Vec2 => {
        return mod(p.add(s.mul(0.5)), s).sub(s.mul(0.5))
}).setLayout({
        name: 'opRepeatVec2',
        type: 'vec2',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 's', type: 'float' }
        ]
})

export const opRepeatVec3 = Fn(([p, c]: [Vec3, Vec3]): Vec3 => {
        return mod(p.add(c.mul(0.5)), c).sub(c.mul(0.5))
}).setLayout({
        name: 'opRepeatVec3',
        type: 'vec3',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'c', type: 'vec3' }
        ]
})

export const opRepeatVec2Limited = Fn(([p, lima, limb, s]: [Vec2, Vec2, Vec2, Float]): Vec2 => {
        return p.sub(s.mul(p.div(s).floor().clamp(lima, limb)))
}).setLayout({
        name: 'opRepeatVec2Limited',
        type: 'vec2',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 'lima', type: 'vec2' },
                { name: 'limb', type: 'vec2' },
                { name: 's', type: 'float' }
        ]
})

export const opRepeatVec3Limited = Fn(([p, lima, limb, s]: [Vec3, Vec3, Vec3, Float]): Vec3 => {
        return p.sub(s.mul(p.div(s).floor().clamp(lima, limb)))
}).setLayout({
        name: 'opRepeatVec3Limited',
        type: 'vec3',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'lima', type: 'vec3' },
                { name: 'limb', type: 'vec3' },
                { name: 's', type: 'float' }
        ]
})