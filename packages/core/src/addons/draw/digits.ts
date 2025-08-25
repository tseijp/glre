import { Fn, Float, Vec2, Vec3, Vec4, Mat2, Int, If, Loop, Break, float, vec2, int } from '../../node'

const DIGITS_SIZE = vec2(0.02)
const DIGITS_DECIMALS = float(2.0)
const DIGITS_VALUE_OFFSET = vec2(-6.0, 3.0)

const digitsCore = Fn(([st, value, nDecDigit]: [Vec2, Float, Float]): Float => {
        const adjustedSt = st.div(DIGITS_SIZE).toVar('adjustedSt')
        const absValue = value.abs().toVar('absValue')
        const biggestDigitIndex = absValue.log2().div(float(10).log2()).floor().max(0).toVar('biggestDigitIndex')
        const counter = absValue.floor().toVar('counter')
        const nIntDigits = float(1).toVar('nIntDigits')

        Loop(int(9), () => {
                counter.assign(counter.mul(0.1).floor())
                nIntDigits.addAssign(1)
                If(counter.equal(0), () => {
                        Break()
                })
        })

        let digit = float(12).toVar('digit')
        const digitIndex = nIntDigits.sub(1).sub(adjustedSt.x.floor()).toVar('digitIndex')

        If(digitIndex.greaterThan(nDecDigit.negate().sub(1.5)), () => {
                If(digitIndex.greaterThan(biggestDigitIndex), () => {
                        If(value.lessThan(0), () => {
                                If(digitIndex.lessThan(biggestDigitIndex.add(1.5)), () => {
                                        digit.assign(11)
                                })
                        })
                }).Else(() => {
                        If(digitIndex.equal(-1), () => {
                                If(nDecDigit.greaterThan(0), () => {
                                        digit.assign(10)
                                })
                        }).Else(() => {
                                If(digitIndex.lessThan(0), () => {
                                        digitIndex.addAssign(1)
                                })
                                const digitValue = absValue.div(float(10).pow(digitIndex)).toVar('digitValue')
                                digit.assign(digitValue.add(0.0001).floor().mod(10))
                        })
                })
        })

        const pos = vec2(adjustedSt.x.fract(), adjustedSt.y).toVar('pos')
        If(pos.x.lessThan(0), () => {
                return float(0)
        })
        If(pos.y.lessThan(0), () => {
                return float(0)
        })
        If(pos.x.greaterThanEqual(1), () => {
                return float(0)
        })
        If(pos.y.greaterThanEqual(1), () => {
                return float(0)
        })

        const bin = float(0).toVar('bin')

        If(digit.lessThan(0.5), () => {
                bin.assign(
                        float(7)
                                .add(float(5).mul(16))
                                .add(float(5).mul(256))
                                .add(float(5).mul(4096))
                                .add(float(7).mul(65536))
                )
        })
                .ElseIf(digit.lessThan(1.5), () => {
                        bin.assign(
                                float(2)
                                        .add(float(2).mul(16))
                                        .add(float(2).mul(256))
                                        .add(float(2).mul(4096))
                                        .add(float(2).mul(65536))
                        )
                })
                .ElseIf(digit.lessThan(2.5), () => {
                        bin.assign(
                                float(7)
                                        .add(float(1).mul(16))
                                        .add(float(7).mul(256))
                                        .add(float(4).mul(4096))
                                        .add(float(7).mul(65536))
                        )
                })
                .ElseIf(digit.lessThan(3.5), () => {
                        bin.assign(
                                float(7)
                                        .add(float(4).mul(16))
                                        .add(float(7).mul(256))
                                        .add(float(4).mul(4096))
                                        .add(float(7).mul(65536))
                        )
                })
                .ElseIf(digit.lessThan(4.5), () => {
                        bin.assign(
                                float(4)
                                        .add(float(7).mul(16))
                                        .add(float(5).mul(256))
                                        .add(float(1).mul(4096))
                                        .add(float(1).mul(65536))
                        )
                })
                .ElseIf(digit.lessThan(5.5), () => {
                        bin.assign(
                                float(7)
                                        .add(float(4).mul(16))
                                        .add(float(7).mul(256))
                                        .add(float(1).mul(4096))
                                        .add(float(7).mul(65536))
                        )
                })
                .ElseIf(digit.lessThan(6.5), () => {
                        bin.assign(
                                float(7)
                                        .add(float(5).mul(16))
                                        .add(float(7).mul(256))
                                        .add(float(1).mul(4096))
                                        .add(float(7).mul(65536))
                        )
                })
                .ElseIf(digit.lessThan(7.5), () => {
                        bin.assign(
                                float(4)
                                        .add(float(4).mul(16))
                                        .add(float(4).mul(256))
                                        .add(float(4).mul(4096))
                                        .add(float(7).mul(65536))
                        )
                })
                .ElseIf(digit.lessThan(8.5), () => {
                        bin.assign(
                                float(7)
                                        .add(float(5).mul(16))
                                        .add(float(7).mul(256))
                                        .add(float(5).mul(4096))
                                        .add(float(7).mul(65536))
                        )
                })
                .ElseIf(digit.lessThan(9.5), () => {
                        bin.assign(
                                float(7)
                                        .add(float(4).mul(16))
                                        .add(float(7).mul(256))
                                        .add(float(5).mul(4096))
                                        .add(float(7).mul(65536))
                        )
                })
                .ElseIf(digit.lessThan(10.5), () => {
                        bin.assign(
                                float(2)
                                        .add(float(0).mul(16))
                                        .add(float(0).mul(256))
                                        .add(float(0).mul(4096))
                                        .add(float(0).mul(65536))
                        )
                })
                .ElseIf(digit.lessThan(11.5), () => {
                        bin.assign(
                                float(0)
                                        .add(float(0).mul(16))
                                        .add(float(7).mul(256))
                                        .add(float(0).mul(4096))
                                        .add(float(0).mul(65536))
                        )
                })

        const pixel = pos.mul(vec2(4, 5)).floor().toVar('pixel')
        return bin
                .div(float(2).pow(pixel.x.add(pixel.y.mul(4))))
                .floor()
                .mod(2)
}).setLayout({
        name: 'digitsCore',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'value', type: 'float' },
                { name: 'nDecDigit', type: 'float' },
        ],
})

export const digitsFloat = Fn(([st, value, nDecDigit]: [Vec2, Float, Float]): Float => {
        return digitsCore(st, value, nDecDigit)
}).setLayout({
        name: 'digitsFloat',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'value', type: 'float' },
                { name: 'nDecDigit', type: 'float' },
        ],
})

export const digitsInt = Fn(([st, value]: [Vec2, Int]): Float => {
        return digitsCore(st, value.toFloat(), float(0))
}).setLayout({
        name: 'digitsInt',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'value', type: 'int' },
        ],
})

export const digits = Fn(([st, value]: [Vec2, Float]): Float => {
        return digitsCore(st, value, DIGITS_DECIMALS)
}).setLayout({
        name: 'digits',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'value', type: 'float' },
        ],
})

export const digitsVec2 = Fn(([st, v]: [Vec2, Vec2]): Float => {
        let rta = float(0).toVar('rta')
        Loop(int(2), ({ i }) => {
                const pos = st.add(vec2(i.toFloat(), 0).mul(DIGITS_SIZE).mul(DIGITS_VALUE_OFFSET)).toVar('pos')
                let value = float(0).toVar('value')
                If(i.equal(int(0)), () => {
                        value.assign(v.x)
                }).Else(() => {
                        value.assign(v.y)
                })
                rta.addAssign(digits(pos, value))
        })
        return rta
}).setLayout({
        name: 'digitsVec2',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'v', type: 'vec2' },
        ],
})

export const digitsVec3 = Fn(([st, v]: [Vec2, Vec3]): Float => {
        let rta = float(0).toVar('rta')
        Loop(int(3), ({ i }) => {
                const pos = st.add(vec2(i.toFloat(), 0).mul(DIGITS_SIZE).mul(DIGITS_VALUE_OFFSET)).toVar('pos')
                let value = float(0).toVar('value')
                If(i.equal(int(0)), () => {
                        value.assign(v.x)
                })
                        .ElseIf(i.equal(1), () => {
                                value.assign(v.y)
                        })
                        .Else(() => {
                                value.assign(v.z)
                        })
                rta.addAssign(digits(pos, value))
        })
        return rta
}).setLayout({
        name: 'digitsVec3',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'v', type: 'vec3' },
        ],
})

export const digitsVec4 = Fn(([st, v]: [Vec2, Vec4]): Float => {
        let rta = float(0).toVar('rta')
        Loop(int(4), ({ i }) => {
                const pos = st.add(vec2(i.toFloat(), 0).mul(DIGITS_SIZE).mul(DIGITS_VALUE_OFFSET)).toVar('pos')
                let value = float(0).toVar('value')
                If(i.equal(0), () => {
                        value.assign(v.x)
                })
                        .ElseIf(i.equal(1), () => {
                                value.assign(v.y)
                        })
                        .ElseIf(i.equal(2), () => {
                                value.assign(v.z)
                        })
                        .Else(() => {
                                value.assign(v.w)
                        })
                rta.addAssign(digits(pos, value))
        })
        return rta
}).setLayout({
        name: 'digitsVec4',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'v', type: 'vec4' },
        ],
})

export const digitsMat2 = Fn(([st, matrix]: [Vec2, Mat2]): Float => {
        let rta = float(0).toVar('rta')
        // Manually unroll the matrix elements
        const pos00 = st
                .add(vec2(0, 0).mul(DIGITS_SIZE).mul(DIGITS_VALUE_OFFSET))
                .sub(DIGITS_SIZE.mul(vec2(0, 3)))
                .toVar('pos00')
        const pos01 = st
                .add(vec2(0, 1).mul(DIGITS_SIZE).mul(DIGITS_VALUE_OFFSET))
                .sub(DIGITS_SIZE.mul(vec2(0, 3)))
                .toVar('pos01')
        const pos10 = st
                .add(vec2(1, 0).mul(DIGITS_SIZE).mul(DIGITS_VALUE_OFFSET))
                .sub(DIGITS_SIZE.mul(vec2(0, 3)))
                .toVar('pos10')
        const pos11 = st
                .add(vec2(1, 1).mul(DIGITS_SIZE).mul(DIGITS_VALUE_OFFSET))
                .sub(DIGITS_SIZE.mul(vec2(0, 3)))
                .toVar('pos11')

        rta.addAssign(digits(pos00, matrix.element(int(0)).element(int(0))))
        rta.addAssign(digits(pos01, matrix.element(int(1)).element(int(0))))
        rta.addAssign(digits(pos10, matrix.element(int(0)).element(int(1))))
        rta.addAssign(digits(pos11, matrix.element(int(1)).element(int(1))))

        return rta
}).setLayout({
        name: 'digitsMat2',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'matrix', type: 'mat2' },
        ],
})

// Note: Mat3 and Mat4 display functions are omitted for simplicity
// due to complexity in matrix element access. Only Mat2 is implemented.
