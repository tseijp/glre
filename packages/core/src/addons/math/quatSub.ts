import { Fn, Vec4, vec4 } from '../../node'

export const quatSub = Fn(([a, b]: [Vec4, Vec4]): Vec4 => {
        return vec4(a.xyz.sub(b.xyz), a.w.sub(b.w))
}).setLayout({
        name: 'quatSub',
        type: 'vec4',
        inputs: [
                {
                        name: 'a',
                        type: 'vec4'
                },
                {
                        name: 'b',
                        type: 'vec4'
                }
        ]
})