import { Fn, Vec2, Vec4, vec2, vec4, floor, dot, select } from '../../node'

export const hexTile = Fn(([st]: [Vec2]): Vec4 => {
        const s = vec2(1, 1.7320508).toVar('s')
        const o = vec2(0.5, 1).toVar('o')
        const stYX = vec2(st.y, st.x).toVar('stYX')
        const i = floor(vec4(stYX, stYX.sub(o)).div(vec4(s, s)))
                .add(0.5)
                .toVar('i')
        const f = vec4(stYX.sub(i.xy.mul(s)), stYX.sub(i.zw.add(0.5).mul(s))).toVar('f')
        const dotXY = dot(f.xy, f.xy)
        const dotZW = dot(f.zw, f.zw)
        return select(vec4(f.wz.add(0.5), i.zw.add(o)), vec4(f.yx.add(0.5), i.xy), dotXY.lessThan(dotZW))
}).setLayout({
        name: 'hexTile',
        type: 'vec4',
        inputs: [{ name: 'st', type: 'vec2' }],
})
