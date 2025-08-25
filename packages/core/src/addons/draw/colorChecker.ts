import { Fn, Vec2, Vec4, Int, vec2, vec4, floor, float } from '../../node'
import { scale2dVec } from '../space/scale'
import { macbeth } from '../color/palette/macbeth'
import { crossSDF } from '../sdf/crossSDF'
import { rectSDF } from '../sdf/rectSDF'
import { rectFill } from './rect'
import { fill } from './fill'
import { stroke } from './stroke'

export const colorCheckerTile = Fn(([uv]: [Vec2]): Vec4 => {
        const st = scale2dVec(uv, vec2(1, 1.5)).mul(vec2(6, 4)).toVar('st')
        return vec4(st.fract(), st.floor())
}).setLayout({
        name: 'colorCheckerTile',
        type: 'vec4',
        inputs: [{ name: 'uv', type: 'vec2' }],
})

export const colorCheckerMacbeth = Fn(([uv]: [Vec2]): Vec4 => {
        const t = colorCheckerTile(vec2(uv.x, uv.y.oneMinus())).toVar('t')
        const index = t.w.mul(6).add(t.z).floor().toInt().toVar('index')

        const color = macbeth(index)
                .mul(rectFill(t.xy, vec2(0.8)))
                .add(fill(crossSDF(uv, float(2)), float(0.015)))
                .add(
                        stroke(rectSDF(uv, vec2(1.015, 0.68)), float(1), float(0.01))
                                .sub(rectFill(uv, vec2(0.966, 1)))
                                .sub(rectFill(uv, vec2(1.1, 0.63)))
                                .saturate()
                )
                .toVar('color')

        const alpha = rectFill(uv, vec2(1.03, 0.69)).toVar('alpha')
        return vec4(color.saturate().mul(alpha), alpha)
}).setLayout({
        name: 'colorCheckerMacbeth',
        type: 'vec4',
        inputs: [{ name: 'uv', type: 'vec2' }],
})

export const colorChecker = colorCheckerMacbeth
