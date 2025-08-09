import { X, Fn, Float, Vec2, Vec3, Vec4 } from '../../node'
import { cubic, cubicVec2, cubicVec3, cubicVec4 } from './cubic'

export const cubicMix = Fn(([a, b, t]: [Float, Float, Float]): X => {
        return a.add(b.sub(a).mul(cubic(t)))
}).setLayout({
        name: 'cubicMix',
        type: 'auto',
        inputs: [
                { name: 'a', type: 'auto' },
                { name: 'b', type: 'auto' },
                { name: 't', type: 'auto' },
        ],
})

export const cubicMixVec2 = Fn(([a, b, t]: [Vec2, Vec2, Vec2]): X => {
        return a.add(b.sub(a).mul(cubicVec2(t)))
}).setLayout({
        name: 'cubicMixVec2',
        type: 'auto',
        inputs: [
                { name: 'a', type: 'auto' },
                { name: 'b', type: 'auto' },
                { name: 't', type: 'auto' },
        ],
})
export const cubicMixVec3 = Fn(([a, b, t]: [Vec3, Vec3, Vec3]): X => {
        return a.add(b.sub(a).mul(cubicVec3(t)))
}).setLayout({
        name: 'cubicMixVec3',
        type: 'auto',
        inputs: [
                { name: 'a', type: 'auto' },
                { name: 'b', type: 'auto' },
                { name: 't', type: 'auto' },
        ],
})

export const cubicMixVec4 = Fn(([a, b, t]: [Vec4, Vec4, Vec4]): X => {
        return a.add(b.sub(a).mul(cubicVec4(t)))
}).setLayout({
        name: 'cubicMixVec4',
        type: 'auto',
        inputs: [
                { name: 'a', type: 'auto' },
                { name: 'b', type: 'auto' },
                { name: 't', type: 'auto' },
        ],
})
