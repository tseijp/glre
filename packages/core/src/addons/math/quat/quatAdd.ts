import { Fn, Vec4, vec4 } from '../../../node'

export const quatAdd = Fn(([a, b]: [Vec4, Vec4]): Vec4 => {
        return vec4(a.xyz.add(b.xyz), a.w.add(b.w))
}).setLayout({
        name: 'quatAdd',
        type: 'vec4',
        inputs: [
                {
                        name: 'a',
                        type: 'vec4',
                },
                {
                        name: 'b',
                        type: 'vec4',
                },
        ],
})
