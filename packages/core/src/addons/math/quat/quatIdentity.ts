import { Fn, Vec4, vec4 } from '../../../node'

export const quatIdentity = Fn(([]): Vec4 => {
        return vec4(0, 0, 0, 1)
}).setLayout({
        name: 'quatIdentity',
        type: 'vec4',
        inputs: [],
})
