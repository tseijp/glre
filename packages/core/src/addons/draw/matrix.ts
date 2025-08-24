import { Fn, Vec2, Vec4, Mat2, Mat3, Mat4, vec4, vec2, step } from '../../node'
import { digits } from './digits'

const DIGITS_SIZE = vec2(0.02)
const DIGITS_VALUE_OFFSET = vec2(-6.0, 3.0)

export const matrixMat2 = Fn(([st, M]: [Vec2, Mat2]): Vec4 => {
        const rta = vec4(0).toVar('rta')
        const size = DIGITS_SIZE.mul(DIGITS_VALUE_OFFSET.abs()).mul(2)
        rta.a.assign(
                step(DIGITS_SIZE.x.negate(), st.x)
                        .mul(step(st.x, size.x))
                        .mul(step(DIGITS_SIZE.y.negate(), st.y))
                        .mul(step(st.y, size.y))
                        .mul(0.5)
        )
        rta.assign(rta.add(digits(st, M)))
        return rta
}).setLayout({
        name: 'matrixMat2',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'M', type: 'mat2' },
        ],
})

export const matrixMat3 = Fn(([st, M]: [Vec2, Mat3]): Vec4 => {
        const rta = vec4(0).toVar('rta')
        const size = DIGITS_SIZE.mul(DIGITS_VALUE_OFFSET.abs()).mul(3)
        rta.a.assign(
                step(DIGITS_SIZE.x.negate(), st.x)
                        .mul(step(st.x, size.x))
                        .mul(step(DIGITS_SIZE.y.negate(), st.y))
                        .mul(step(st.y, size.y))
                        .mul(0.5)
        )
        rta.assign(rta.add(digits(st, M)))
        return rta
}).setLayout({
        name: 'matrixMat3',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'M', type: 'mat3' },
        ],
})

export const matrixMat4 = Fn(([st, M]: [Vec2, Mat4]): Vec4 => {
        const rta = vec4(0).toVar('rta')
        const size = DIGITS_SIZE.mul(DIGITS_VALUE_OFFSET.abs()).mul(4)
        rta.a.assign(
                step(DIGITS_SIZE.x.negate(), st.x)
                        .mul(step(st.x, size.x))
                        .mul(step(DIGITS_SIZE.y.negate(), st.y))
                        .mul(step(st.y, size.y))
                        .mul(0.5)
        )
        rta.assign(rta.add(digits(st, M)))
        return rta
}).setLayout({
        name: 'matrixMat4',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'M', type: 'mat4' },
        ],
})

export const matrix = matrixMat4
