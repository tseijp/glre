import { Fn, Float, Vec3, Vec4, float, vec3, vec4, select } from '../../../node'

const SRGB_EPSILON = float('1e-10')

export const srgb2rgbFloat = Fn(([v]: [Float]): Float => {
        return select(v.mul(0.0773993808), v.add(0.055).mul(0.947867298578199).pow(2.4), v.lessThan(0.04045))
}).setLayout({
        name: 'srgb2rgb',
        type: 'float',
        inputs: [{ name: 'v', type: 'float' }],
})

export const srgb2rgbVec3 = Fn(([srgb]: [Vec3]): Vec3 => {
        return vec3(
                srgb2rgbFloat(srgb.r.add(SRGB_EPSILON)),
                srgb2rgbFloat(srgb.g.add(SRGB_EPSILON)),
                srgb2rgbFloat(srgb.b.add(SRGB_EPSILON))
        )
}).setLayout({
        name: 'srgb2rgbVec3',
        type: 'vec3',
        inputs: [{ name: 'srgb', type: 'vec3' }],
})

export const srgb2rgbVec4 = Fn(([srgb]: [Vec4]): Vec4 => {
        return vec4(srgb2rgbVec3(srgb.rgb), srgb.a)
}).setLayout({
        name: 'srgb2rgbVec4',
        type: 'vec4',
        inputs: [{ name: 'srgb', type: 'vec4' }],
})

// Default export for convenience
export const srgb2rgb = srgb2rgbVec3
