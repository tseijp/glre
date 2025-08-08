import { Fn, mat3, vec4, Vec3, Vec4 } from '../../../node'

const RGB2YUV_HDTV = mat3(
        0.2126,  -0.09991, 0.615,
        0.7152,  -0.33609,-0.55861,
        0.0722,   0.426,  -0.05639
)

const RGB2YUV_SDTV = mat3(
        0.299, -0.14713,  0.615,
        0.587, -0.28886, -0.51499,
        0.114,  0.436,   -0.10001
)

export const rgb2yuv3 = Fn(([rgb]: [Vec3]): Vec3 => {
        return RGB2YUV_HDTV.mul(rgb)
}).setLayout({
        name: 'rgb2yuv3',
        type: 'vec3',
        inputs: [{ name: 'rgb', type: 'vec3' }]
})

export const rgb2yuv4 = Fn(([rgb]: [Vec4]): Vec4 => {
        const yuv = rgb2yuv3(rgb.xyz)
        return vec4(yuv, rgb.w)
}).setLayout({
        name: 'rgb2yuv4',
        type: 'vec4',
        inputs: [{ name: 'rgb', type: 'vec4' }]
})

export const rgb2yuvSDTV = Fn(([rgb]: [Vec3]): Vec3 => {
        return RGB2YUV_SDTV.mul(rgb)
}).setLayout({
        name: 'rgb2yuvSDTV',
        type: 'vec3',
        inputs: [{ name: 'rgb', type: 'vec3' }]
})

export const rgb2yuv = rgb2yuv3