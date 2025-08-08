import { Fn, atan2, sqrt, vec3, vec4, Vec3, Vec4 } from '../../../node'

export const lab2lch3 = Fn(([lab]: [Vec3]): Vec3 => {
        const chroma = sqrt(lab.y.mul(lab.y).add(lab.z.mul(lab.z)))
        const hue = atan2(lab.z, lab.y).mul(57.2957795131)
        return vec3(lab.x, chroma, hue)
}).setLayout({
        name: 'lab2lch3',
        type: 'vec3',
        inputs: [{ name: 'lab', type: 'vec3' }],
})

export const lab2lch4 = Fn(([lab]: [Vec4]): Vec4 => {
        const lch = lab2lch3(lab.xyz)
        return vec4(lch, lab.w)
}).setLayout({
        name: 'lab2lch4',
        type: 'vec4',
        inputs: [{ name: 'lab', type: 'vec4' }],
})

export const lab2lch = lab2lch3
