import { Fn, Vec3, Vec4, mat3, vec4 } from '../../../node'

// CIE D65 white point transformation matrix
const XYZ2RGB = mat3(
        3.2404542,
        -1.5371385,
        -0.4985314,
        -0.969266,
        1.8760108,
        0.041556,
        0.0556434,
        -0.2040259,
        1.0572252
)

export const xyz2rgb = Fn(([xyz]: [Vec3]): Vec3 => {
        return XYZ2RGB.mul(xyz.mul(0.01))
}).setLayout({
        name: 'xyz2rgb',
        type: 'vec3',
        inputs: [{ name: 'xyz', type: 'vec3' }],
})

export const xyz2rgbVec4 = Fn(([xyz]: [Vec4]): Vec4 => {
        return vec4(xyz2rgb(xyz.xyz), xyz.w)
}).setLayout({
        name: 'xyz2rgbVec4',
        type: 'vec4',
        inputs: [{ name: 'xyz', type: 'vec4' }],
})
