import { Fn, mat3, vec4, Vec3, Vec4 } from '../../../node'

const YUV2RGB_HDTV = mat3(1.0, 1.0, 1.0, 0.0, -0.21482, 2.12798, 1.28033, -0.38059, 0.0)

const YUV2RGB_SDTV = mat3(1.0, 1.0, 1.0, 0.0, -0.39465, 2.03211, 1.13983, -0.5806, 0.0)

export const yuv2rgb3 = Fn(([yuv]: [Vec3]): Vec3 => {
        return YUV2RGB_HDTV.mul(yuv)
}).setLayout({
        name: 'yuv2rgb3',
        type: 'vec3',
        inputs: [{ name: 'yuv', type: 'vec3' }],
})

export const yuv2rgb4 = Fn(([yuv]: [Vec4]): Vec4 => {
        const rgb = yuv2rgb3(yuv.xyz)
        return vec4(rgb, yuv.w)
}).setLayout({
        name: 'yuv2rgb4',
        type: 'vec4',
        inputs: [{ name: 'yuv', type: 'vec4' }],
})

export const yuv2rgbSDTV = Fn(([yuv]: [Vec3]): Vec3 => {
        return YUV2RGB_SDTV.mul(yuv)
}).setLayout({
        name: 'yuv2rgbSDTV',
        type: 'vec3',
        inputs: [{ name: 'yuv', type: 'vec3' }],
})

export const yuv2rgb = yuv2rgb3
