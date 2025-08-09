import { Fn, Vec4, Float, vec4, If, Return, float } from '../../../node'

export const quatLerp = Fn(([qa, qb, t]: [Vec4, Vec4, Float]): Vec4 => {
        const cosHalfTheta = qa.w.mul(qb.w).add(qa.xyz.dot(qb.xyz)).toVar('cosHalfTheta')
        const adjustedQb = qb.negate().select(qb, cosHalfTheta.lessThan(0)).toVar('adjustedQb')
        const absCosHalfTheta = cosHalfTheta.abs().toVar('absCosHalfTheta')

        If(absCosHalfTheta.greaterThanEqual(1), () => {
                Return(qa)
        })

        const halfTheta = absCosHalfTheta.acos().toVar('halfTheta')
        const sinHalfTheta = float(1).sub(absCosHalfTheta.mul(absCosHalfTheta)).sqrt().toVar('sinHalfTheta')

        If(sinHalfTheta.abs().lessThan(0.001), () => {
                Return(qa.div(2).add(adjustedQb.div(2)).normalize())
        })

        const ratioA = float(1).sub(t).mul(halfTheta).sin().div(sinHalfTheta).toVar('ratioA')
        const ratioB = t.mul(halfTheta).sin().div(sinHalfTheta).toVar('ratioB')

        return qa.mul(ratioA).add(adjustedQb.mul(ratioB)).normalize()
}).setLayout({
        name: 'quatLerp',
        type: 'vec4',
        inputs: [
                {
                        name: 'qa',
                        type: 'vec4',
                },
                {
                        name: 'qb',
                        type: 'vec4',
                },
                {
                        name: 't',
                        type: 'float',
                },
        ],
})
