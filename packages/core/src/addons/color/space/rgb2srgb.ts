import { Fn, Float, Vec3, Vec4, float, vec3, vec4, select } from '../../../node'

const SRGB_EPSILON = float('1e-10')

export const rgb2srgbFloat = Fn(([c]: [Float]): Float => {
        return select(c.mul(12.92), float(1.055).mul(c.pow(0.4166666666666667)).sub(0.055), c.lessThan(0.0031308))
}).setLayout({
        name: 'rgb2srgb',
        type: 'float',
        inputs: [{ name: 'c', type: 'float' }],
})

export const rgb2srgbVec3 = Fn(([rgb]: [Vec3]): Vec3 => {
        return vec3(
                rgb2srgbFloat(rgb.r.sub(SRGB_EPSILON)),
                rgb2srgbFloat(rgb.g.sub(SRGB_EPSILON)),
                rgb2srgbFloat(rgb.b.sub(SRGB_EPSILON))
        ).saturate()
}).setLayout({
        name: 'rgb2srgbVec3',
        type: 'vec3',
        inputs: [{ name: 'rgb', type: 'vec3' }],
})

export const rgb2srgbVec4 = Fn(([rgb]: [Vec4]): Vec4 => {
        return vec4(rgb2srgbVec3(rgb.rgb), rgb.a)
}).setLayout({
        name: 'rgb2srgbVec4',
        type: 'vec4',
        inputs: [{ name: 'rgb', type: 'vec4' }],
})

// Default export for convenience
export const rgb2srgb = rgb2srgbVec3
