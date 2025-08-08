import { Fn, mat3, vec4, Vec3, Vec4 } from '../../../node'

const RGB2YIQ = mat3(
        0.300,  0.5900,  0.1100,
        0.599, -0.2773, -0.3217,
        0.213, -0.5251,  0.3121
)

export const rgb2yiq3 = Fn(([rgb]: [Vec3]): Vec3 => {
        return RGB2YIQ.mul(rgb)
}).setLayout({
        name: 'rgb2yiq3',
        type: 'vec3',
        inputs: [{ name: 'rgb', type: 'vec3' }]
})

export const rgb2yiq4 = Fn(([rgb]: [Vec4]): Vec4 => {
        const yiq = rgb2yiq3(rgb.xyz)
        return vec4(yiq, rgb.w)
}).setLayout({
        name: 'rgb2yiq4',
        type: 'vec4',
        inputs: [{ name: 'rgb', type: 'vec4' }]
})

export const rgb2yiq = rgb2yiq3