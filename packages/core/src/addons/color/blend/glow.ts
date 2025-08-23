import { Fn, Float, Vec3 } from '../../../node'
import { blendReflect, blendReflectVec3 } from './reflect'

export const blendGlow = Fn(([base, blend]: [Float, Float]): Float => {
        return blendReflect(blend, base)
}).setLayout({
        name: 'blendGlow',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' }
        ]
})

export const blendGlowVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return blendReflectVec3(blend, base)
}).setLayout({
        name: 'blendGlowVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendGlowVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendGlowVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendGlowVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})