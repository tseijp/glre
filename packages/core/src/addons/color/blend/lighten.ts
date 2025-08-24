import { Fn, Float, Vec3, vec3, max } from '../../../node'

export const blendLighten = Fn(([base, blend]: [Float, Float]): Float => {
        return max(blend, base)
}).setLayout({
        name: 'blendLighten',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' },
        ],
})

export const blendLightenVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(blendLighten(base.r, blend.r), blendLighten(base.g, blend.g), blendLighten(base.b, blend.b))
}).setLayout({
        name: 'blendLightenVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
        ],
})

export const blendLightenVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendLightenVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendLightenVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' },
        ],
})
