import { Fn, Vec4, Float, vec4 } from '../../../node'

export const quatDiv = Fn(([q, s]: [Vec4, Float]): Vec4 => {
        return vec4(q.xyz.div(s), q.w.div(s))
}).setLayout({
        name: 'quatDiv',
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
