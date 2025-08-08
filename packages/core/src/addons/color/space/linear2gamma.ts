import { Fn, Vec4, float, vec4, X } from '../../../node'

const INV_GAMMA = float(1).div(2.2)

export const linear2gamma = Fn(([v]: [X]): X => {
        return v.pow(INV_GAMMA)
}).setLayout({
        name: 'linear2gamma',
        type: 'auto',
        inputs: [{ name: 'v', type: 'auto' }],
})

export const linear2gammaVec4 = Fn(([v]: [Vec4]): Vec4 => {
        return vec4(linear2gamma(v.xyz), v.w)
}).setLayout({
        name: 'linear2gammaVec4',
        type: 'vec4',
        inputs: [{ name: 'v', type: 'vec4' }],
})
