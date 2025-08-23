import { Fn, Float, Vec3, vec3, If, Return } from '../../../node'
import { blendColorBurn, blendColorBurnVec3 } from './colorBurn'
import { blendColorDodge, blendColorDodgeVec3 } from './colorDodge'

export const blendVividLight = Fn(([base, blend]: [Float, Float]): Float => {
        If(blend.lessThan(0.5), () => {
                Return(blendColorBurn(base, blend.mul(2)))
        })
        Return(blendColorDodge(base, blend.sub(0.5).mul(2)))
}).setLayout({
        name: 'blendVividLight',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' }
        ]
})

export const blendVividLightVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(
                blendVividLight(base.r, blend.r),
                blendVividLight(base.g, blend.g),
                blendVividLight(base.b, blend.b)
        )
}).setLayout({
        name: 'blendVividLightVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendVividLightVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendVividLightVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendVividLightVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})