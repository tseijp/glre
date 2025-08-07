import { Fn, Vec4, Float } from '../../../node'

export const quatLengthSq = Fn(([q]: [Vec4]): Float => {
        return q.xyz.dot(q.xyz).add(q.w.mul(q.w))
}).setLayout({
        name: 'quatLengthSq',
        type: 'float',
        inputs: [
                {
                        name: 'q',
                        type: 'vec4',
                },
        ],
})
