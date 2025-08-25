import { Fn, Float, Vec3 } from '../../../node'
import { blendOverlay, blendOverlayVec3 } from './overlay'

export const blendHardLight = Fn(([base, blend]: [Float, Float]): Float => {
        return blendOverlay(blend, base)
}).setLayout({
        name: 'blendHardLight',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' },
        ],
})

export const blendHardLightVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return blendOverlayVec3(blend, base)
}).setLayout({
        name: 'blendHardLightVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
        ],
})

export const blendHardLightVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendHardLightVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendHardLightVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' },
        ],
})
