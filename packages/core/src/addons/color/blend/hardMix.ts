import { Fn, Float, Vec3, vec3, If, Return } from '../../../node'
import { blendVividLight, blendVividLightVec3 } from './vividLight'

export const blendHardMix = Fn(([base, blend]: [Float, Float]): Float => {
        If(blendVividLight(base, blend).lessThan(0.5), () => {
                Return(0)
        })
        Return(1)
}).setLayout({
        name: 'blendHardMix',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' }
        ]
})

export const blendHardMixVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(
                blendHardMix(base.r, blend.r),
                blendHardMix(base.g, blend.g),
                blendHardMix(base.b, blend.b)
        )
}).setLayout({
        name: 'blendHardMixVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendHardMixVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendHardMixVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendHardMixVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})