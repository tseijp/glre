import { Fn, Vec2, Vec4, Float, mod, floor, fract } from '../../node'
import { sqTile } from './sqTile'

export const brickTile = Fn(([t]: [Vec4]): Vec4 => {
        const result = t.toVar('result')
        result.x.assign(result.x.add(mod(result.w, 2).mul(0.5)))
        result.z.assign(floor(result.z.add(result.x)))
        result.x.assign(fract(result.x))
        return result
}).setLayout({
        name: 'brickTile',
        type: 'vec4',
        inputs: [{ name: 't', type: 'vec4' }],
})

export const brickTileVec2 = Fn(([st]: [Vec2]): Vec4 => {
        return brickTile(sqTile(st))
}).setLayout({
        name: 'brickTileVec2',
        type: 'vec4',
        inputs: [{ name: 'st', type: 'vec2' }],
})

export const brickTileFloat = Fn(([st, s]: [Vec2, Float]): Vec4 => {
        return brickTileVec2(st.mul(s))
}).setLayout({
        name: 'brickTileFloat',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 's', type: 'float' },
        ],
})

export const brickTileVec2Scale = Fn(([st, s]: [Vec2, Vec2]): Vec4 => {
        return brickTileVec2(st.mul(s))
}).setLayout({
        name: 'brickTileVec2Scale',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 's', type: 'vec2' },
        ],
})
