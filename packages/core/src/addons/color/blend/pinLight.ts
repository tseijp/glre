import { Fn, Float, Vec3, vec3, If } from '../../../node'
import { blendDarken } from './darken'
import { blendLighten } from './lighten'

export const blendPinLight = Fn(([base, blend]: [Float, Float]): Float => {
        If(blend.lessThan(0.5), () => {
                return blendDarken(base, blend.mul(2))
        })
        return blendLighten(base, blend.sub(0.5).mul(2))
}).setLayout({
        name: 'blendPinLight',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' },
        ],
})

export const blendPinLightVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(blendPinLight(base.x, blend.x), blendPinLight(base.y, blend.y), blendPinLight(base.z, blend.z))
}).setLayout({
        name: 'blendPinLightVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
        ],
})

export const blendPinLightVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendPinLightVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendPinLightVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' },
        ],
})
