import { Fn, Vec4, float, vec4, X } from '../../../node'

const GAMMA = float(2.2)

export const gamma2linear = Fn(([v]: [X]): X => {
        return v.pow(GAMMA)
}).setLayout({
        name: 'gamma2linear',
        type: 'auto',
        inputs: [{ name: 'v', type: 'auto' }],
})

export const gamma2linearVec4 = Fn(([v]: [Vec4]): Vec4 => {
        return vec4(gamma2linear(v.xyz), v.w)
}).setLayout({
        name: 'gamma2linearVec4',
        type: 'vec4',
        inputs: [{ name: 'v', type: 'vec4' }],
})
