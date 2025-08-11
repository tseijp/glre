import { Fn, Vec2, Vec4, Float, mod, abs } from '../../node'
import { sqTile } from './sqTile'

export const checkerTile = Fn(([t]: [Vec4]): Float => {
        const c = mod(t.zw, 2).toVar('c')
        return abs(c.x.sub(c.y))
}).setLayout({
        name: 'checkerTile',
        type: 'float',
        inputs: [{ name: 't', type: 'vec4' }],
})

export const checkerTileVec2 = Fn(([v]: [Vec2]): Float => {
        return checkerTile(sqTile(v))
}).setLayout({
        name: 'checkerTileVec2',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec2' }],
})

export const checkerTileFloat = Fn(([v, s]: [Vec2, Float]): Float => {
        return checkerTileVec2(v.mul(s))
}).setLayout({
        name: 'checkerTileFloat',
        type: 'float',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 's', type: 'float' },
        ],
})

export const checkerTileVec2Scale = Fn(([v, s]: [Vec2, Vec2]): Float => {
        return checkerTileVec2(v.mul(s))
}).setLayout({
        name: 'checkerTileVec2Scale',
        type: 'float',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 's', type: 'vec2' },
        ],
})
