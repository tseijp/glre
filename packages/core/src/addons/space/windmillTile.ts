import { Fn, Vec2, Vec4, Float, mod, abs, vec4 } from '../../node'
import { TWO_PI } from '../math'
import { rotate2DBasic } from './rotate'
import { sqTile } from './sqTile'

export const windmillTile = Fn(([t, turn]: [Vec4, Float]): Vec4 => {
        const a = abs(mod(t.z, 2).sub(mod(t.w, 2)))
                .add(mod(t.w, 2).mul(2))
                .mul(0.25)
        return vec4(rotate2DBasic(t.xy, a.mul(turn)), t.zw)
}).setLayout({
        name: 'windmillTile',
        type: 'vec4',
        inputs: [
                { name: 't', type: 'vec4' },
                { name: 'turn', type: 'float' },
        ],
})

export const windmillTileDefault = Fn(([t]: [Vec4]): Vec4 => {
        const a = abs(mod(t.z, 2).sub(mod(t.w, 2)))
                .add(mod(t.w, 2).mul(2))
                .mul(0.25)
        return vec4(rotate2DBasic(t.xy, a.mul(TWO_PI)), t.zw)
}).setLayout({
        name: 'windmillTileDefault',
        type: 'vec4',
        inputs: [{ name: 't', type: 'vec4' }],
})

export const windmillTileVec2 = Fn(([v]: [Vec2]): Vec4 => {
        return windmillTileDefault(sqTile(v))
}).setLayout({
        name: 'windmillTileVec2',
        type: 'vec4',
        inputs: [{ name: 'v', type: 'vec2' }],
})

export const windmillTileFloat = Fn(([v, s]: [Vec2, Float]): Vec4 => {
        return windmillTileVec2(v.mul(s))
}).setLayout({
        name: 'windmillTileFloat',
        type: 'vec4',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 's', type: 'float' },
        ],
})

export const windmillTileVec2Scale = Fn(([v, s]: [Vec2, Vec2]): Vec4 => {
        return windmillTileVec2(v.mul(s))
}).setLayout({
        name: 'windmillTileVec2Scale',
        type: 'vec4',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 's', type: 'vec2' },
        ],
})
