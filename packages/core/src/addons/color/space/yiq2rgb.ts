import { Fn, mat3, vec4, Vec3, Vec4 } from '../../../node'

const YIQ2RGB = mat3(
        1.0,  0.9469,  0.6235,
        1.0, -0.2747, -0.6357,
        1.0, -1.1085,  1.7020
)

export const yiq2rgb3 = Fn(([yiq]: [Vec3]): Vec3 => {
        return YIQ2RGB.mul(yiq)
}).setLayout({
        name: 'yiq2rgb3',
        type: 'vec3',
        inputs: [{ name: 'yiq', type: 'vec3' }]
})

export const yiq2rgb4 = Fn(([yiq]: [Vec4]): Vec4 => {
        const rgb = yiq2rgb3(yiq.xyz)
        return vec4(rgb, yiq.w)
}).setLayout({
        name: 'yiq2rgb4',
        type: 'vec4',
        inputs: [{ name: 'yiq', type: 'vec4' }]
})

export const yiq2rgb = yiq2rgb3