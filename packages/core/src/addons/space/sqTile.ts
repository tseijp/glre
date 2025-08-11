import { Fn, Vec2, Vec4, Float, vec4, fract, floor } from '../../node'

export const sqTile = Fn(([st]: [Vec2]): Vec4 => {
        return vec4(fract(st), floor(st))
}).setLayout({
        name: 'sqTile',
        type: 'vec4',
        inputs: [{ name: 'st', type: 'vec2' }],
})

export const sqTileScale = Fn(([st, scale]: [Vec2, Float]): Vec4 => {
        return sqTile(st.mul(scale))
}).setLayout({
        name: 'sqTileScale',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'scale', type: 'float' },
        ],
})
