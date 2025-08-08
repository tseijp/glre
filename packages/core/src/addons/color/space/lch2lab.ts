import { Fn, vec3, vec4, Vec3, Vec4 } from '../../../node'

export const lch2lab3 = Fn(([lch]: [Vec3]): Vec3 => {
        const radians = lch.z.mul(0.01745329251)
        return vec3(lch.x, lch.y.mul(radians.cos()), lch.y.mul(radians.sin()))
}).setLayout({
        name: 'lch2lab3',
        type: 'vec3',
        inputs: [{ name: 'lch', type: 'vec3' }],
})

export const lch2lab4 = Fn(([lch]: [Vec4]): Vec4 => {
        const lab = lch2lab3(lch.xyz)
        return vec4(lab, lch.w)
}).setLayout({
        name: 'lch2lab4',
        type: 'vec4',
        inputs: [{ name: 'lch', type: 'vec4' }],
})

export const lch2lab = lch2lab3
