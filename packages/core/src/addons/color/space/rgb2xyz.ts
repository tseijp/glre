import { Fn, Vec3, Vec4, mat3, vec4 } from '../../../node'

// CIE D65 white point transformation matrix
const RGB2XYZ = mat3(0.4124564, 0.3575761, 0.1804375, 0.2126729, 0.7151522, 0.072175, 0.0193339, 0.119192, 0.9503041)

export const rgb2xyz = Fn(([rgb]: [Vec3]): Vec3 => {
        return RGB2XYZ.mul(rgb)
}).setLayout({
        name: 'rgb2xyz',
        type: 'vec3',
        inputs: [{ name: 'rgb', type: 'vec3' }],
})

export const rgb2xyzVec4 = Fn(([rgb]: [Vec4]): Vec4 => {
        return vec4(rgb2xyz(rgb.xyz), rgb.w)
}).setLayout({
        name: 'rgb2xyzVec4',
        type: 'vec4',
        inputs: [{ name: 'rgb', type: 'vec4' }],
})
