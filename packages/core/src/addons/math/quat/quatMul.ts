import { Fn, Vec4, Float, vec4 } from '../../../node'

export const quatMul = Fn(([q1, q2]: [Vec4, Vec4]): Vec4 => {
        return vec4(
                q2.xyz.mul(q1.w).add(q1.xyz.mul(q2.w)).add(q1.xyz.cross(q2.xyz)),
                q1.w.mul(q2.w).sub(q1.xyz.dot(q2.xyz))
        )
}).setLayout({
        name: 'quatMul',
        type: 'vec4',
        inputs: [
                {
                        name: 'q1',
                        type: 'vec4',
                },
                {
                        name: 'q2',
                        type: 'vec4',
                },
        ],
})

export const quatMulScalar = Fn(([q, s]: [Vec4, Float]): Vec4 => {
        return vec4(q.xyz.mul(s), q.w.mul(s))
}).setLayout({
        name: 'quatMulScalar',
        type: 'vec4',
        inputs: [
                {
                        name: 'q',
                        type: 'vec4',
                },
                {
                        name: 's',
                        type: 'float',
                },
        ],
})
