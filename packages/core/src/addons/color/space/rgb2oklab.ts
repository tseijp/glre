import { Fn, mat3, vec3, vec4, Vec3, Vec4 } from '../../../node'

const RGB2OKLAB_A = mat3(
        0.2104542553, 1.9779984951, 0.0259040371,
        0.7936177850, -2.4285922050, 0.7827717662,
        -0.0040720468, 0.4505937099, -0.8086757660
)

const RGB2OKLAB_B = mat3(
        0.4122214708, 0.2119034982, 0.0883024619,
        0.5363325363, 0.6806995451, 0.2817188376,
        0.0514459929, 0.1073969566, 0.6299787005
)

export const rgb2oklab3 = Fn(([rgb]: [Vec3]): Vec3 => {
        const lms = RGB2OKLAB_B.mul(rgb)
        return RGB2OKLAB_A.mul(lms.sign().mul(lms.abs().pow(vec3(0.3333333333333))))
}).setLayout({
        name: 'rgb2oklab3',
        type: 'vec3',
        inputs: [
                {
                        name: 'rgb',
                        type: 'vec3'
                }
        ]
})

export const rgb2oklab4 = Fn(([rgb]: [Vec4]): Vec4 => {
        const oklab = rgb2oklab3(rgb.xyz)
        return vec4(oklab, rgb.w)
}).setLayout({
        name: 'rgb2oklab4',
        type: 'vec4',
        inputs: [
                {
                        name: 'rgb',
                        type: 'vec4'
                }
        ]
})

export const rgb2oklab = rgb2oklab3