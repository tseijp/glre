import { Fn, Vec2, Vec4, Float, vec4 } from '../../node'
import { sqTile } from './sqTile'
import { mirror } from '../math/mirror'

export const mirrorTile = Fn(([t]: [Vec4]): Vec4 => {
        return vec4(mirror(t.xy.add(t.zw)), t.z, t.w)
}).setLayout({
        name: 'mirrorTile',
        type: 'vec4',
        inputs: [{ name: 't', type: 'vec4' }],
})

export const mirrorTileVec2 = Fn(([v]: [Vec2]): Vec4 => {
        return mirrorTile(sqTile(v))
}).setLayout({
        name: 'mirrorTileVec2',
        type: 'vec4',
        inputs: [{ name: 'v', type: 'vec2' }],
})

export const mirrorTileFloat = Fn(([v, s]: [Vec2, Float]): Vec4 => {
        return mirrorTileVec2(v.mul(s))
}).setLayout({
        name: 'mirrorTileFloat',
        type: 'vec4',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 's', type: 'float' },
        ],
})

export const mirrorTileVec2Scale = Fn(([v, s]: [Vec2, Vec2]): Vec4 => {
        return mirrorTileVec2(v.mul(s))
}).setLayout({
        name: 'mirrorTileVec2Scale',
        type: 'vec4',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 's', type: 'vec2' },
        ],
})

export const mirrorXTile = Fn(([t]: [Vec4]): Vec4 => {
        return vec4(mirror(t.x.add(t.z)), t.y, t.z, t.w)
}).setLayout({
        name: 'mirrorXTile',
        type: 'vec4',
        inputs: [{ name: 't', type: 'vec4' }],
})

export const mirrorXTileVec2 = Fn(([v]: [Vec2]): Vec4 => {
        return mirrorXTile(sqTile(v))
}).setLayout({
        name: 'mirrorXTileVec2',
        type: 'vec4',
        inputs: [{ name: 'v', type: 'vec2' }],
})

export const mirrorYTile = Fn(([t]: [Vec4]): Vec4 => {
        return vec4(t.x, mirror(t.y.add(t.w)), t.z, t.w)
}).setLayout({
        name: 'mirrorYTile',
        type: 'vec4',
        inputs: [{ name: 't', type: 'vec4' }],
})

export const mirrorYTileVec2 = Fn(([v]: [Vec2]): Vec4 => {
        return mirrorYTile(sqTile(v))
}).setLayout({
        name: 'mirrorYTileVec2',
        type: 'vec4',
        inputs: [{ name: 'v', type: 'vec2' }],
})
