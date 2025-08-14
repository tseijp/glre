import { Fn, Vec2, Vec4, Float, mat2, vec2, vec4, floor, fract, dot } from '../../node'

export const triTile = Fn(([st]: [Vec2]): Vec4 => {
        const transformed = st.mul(mat2(vec2(1, -1 / 1.7320508), vec2(0, 2 / 1.7320508))).toVar()
        const f = vec4(transformed, transformed.negate()).toVar()
        const i = floor(f).toVar()
        const fFractional = fract(f).toVar()

        const dotXY = dot(fFractional.xy, fFractional.xy)
        const dotZW = dot(fFractional.zw, fFractional.zw)

        const condition = dotXY.lessThan(dotZW)
        const trueValue = vec4(fFractional.xy, vec2(2, 1).mul(i.xy))
        const falseValue = vec4(fFractional.zw, vec2(2, 1).mul(i.zw).add(1).negate())

        return falseValue.select(trueValue, condition)
}).setLayout({
        name: 'triTile',
        type: 'vec4',
        inputs: [{ name: 'st', type: 'vec2' }],
})

export const triTileScaled = Fn(([st, scale]: [Vec2, Float]): Vec4 => {
        return triTile(st.mul(scale))
}).setLayout({
        name: 'triTileScaled',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'scale', type: 'float' },
        ],
})
