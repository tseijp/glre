import { Fn, Vec4, vec4 } from '../../../node'

export const quatConj = Fn(([q]: [Vec4]): Vec4 => {
        return vec4(q.xyz.negate(), q.w)
}).setLayout({
        name: 'quatConj',
        type: 'vec4',
        inputs: [
                {
                        name: 'q',
                        type: 'vec4',
                },
        ],
})
