import { Fn, Vec2, Vec4, Mat2, vec2, step, vec4 } from '../../node'
import { digitsMat2 } from './digits'

const DIGITS_SIZE = vec2(0.02)
const DIGITS_VALUE_OFFSET = vec2(-6.0, 3.0)

export const matrix = Fn(([st, M]: [Vec2, Mat2]): Vec4 => {
        const rta = vec4(0).toVar('rta')
        const size = DIGITS_SIZE.mul(DIGITS_VALUE_OFFSET.abs()).mul(2)
        rta.a.assign(
                step(DIGITS_SIZE.x.negate(), st.x)
                        .mul(step(st.x, size.x))
                        .mul(step(DIGITS_SIZE.y.negate(), st.y))
                        .mul(step(st.y, size.y))
                        .mul(0.5)
        )
        rta.assign(rta.add(digitsMat2(st, M)))
        return rta
}).setLayout({
        name: 'matrixMat2',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'M', type: 'mat2' },
        ],
})
