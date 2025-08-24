import { Fn, Float, Vec3, Vec4, If, sqrt, vec3, vec4 } from '../../../node'

const blendSoftLightFloat = Fn(([base, blend]: [Float, Float]): Float => {
        If(blend.lessThan(0.5), () => {
                return base
                        .mul(2)
                        .mul(blend)
                        .add(base.mul(base).mul(blend.mul(2).oneMinus()))
        })
        return sqrt(base).mul(blend.mul(2).sub(1)).add(base.mul(2).mul(blend.oneMinus()))
}).setLayout({
        name: 'blendSoftLight',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' },
        ],
})

export const blendSoftLight = blendSoftLightFloat

export const blendSoftLightVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(
                blendSoftLightFloat(base.r, blend.r),
                blendSoftLightFloat(base.g, blend.g),
                blendSoftLightFloat(base.b, blend.b)
        )
}).setLayout({
        name: 'blendSoftLightVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
        ],
})

export const blendSoftLightVec4 = Fn(([base, blend]: [Vec4, Vec4]): Vec4 => {
        return vec4(
                blendSoftLightFloat(base.r, blend.r),
                blendSoftLightFloat(base.g, blend.g),
                blendSoftLightFloat(base.b, blend.b),
                blendSoftLightFloat(base.a, blend.a)
        )
}).setLayout({
        name: 'blendSoftLightVec4',
        type: 'vec4',
        inputs: [
                { name: 'base', type: 'vec4' },
                { name: 'blend', type: 'vec4' },
        ],
})

export const blendSoftLightVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendSoftLightVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendSoftLightVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' },
        ],
})
