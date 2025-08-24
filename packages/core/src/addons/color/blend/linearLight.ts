import { Fn, Float, Vec3, vec3, If, Return } from '../../../node'
import { blendLinearBurn } from './linearBurn'
import { blendLinearDodge } from './linearDodge'

export const blendLinearLight = Fn(([base, blend]: [Float, Float]): Float => {
        If(blend.lessThan(0.5), () => {
                Return(blendLinearBurn(base, blend.mul(2)))
        })
        Return(blendLinearDodge(base, blend.sub(0.5).mul(2)))
}).setLayout({
        name: 'blendLinearLight',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' },
        ],
})

export const blendLinearLightVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(
                blendLinearLight(base.r, blend.r),
                blendLinearLight(base.g, blend.g),
                blendLinearLight(base.b, blend.b)
        )
}).setLayout({
        name: 'blendLinearLightVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
        ],
})

export const blendLinearLightVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendLinearLightVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendLinearLightVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' },
        ],
})
