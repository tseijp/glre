import { Fn, Float, Vec3, vec3, If, Return } from '../../../node'

export const blendOverlay = Fn(([base, blend]: [Float, Float]): Float => {
        If(base.lessThan(0.5), () => {
                Return(base.mul(blend).mul(2))
        })
        return base.oneMinus().mul(blend.oneMinus()).mul(2).oneMinus()
}).setLayout({
        name: 'blendOverlay',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' }
        ]
})

export const blendOverlayVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(
                blendOverlay(base.r, blend.r),
                blendOverlay(base.g, blend.g),
                blendOverlay(base.b, blend.b)
        )
}).setLayout({
        name: 'blendOverlayVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendOverlayVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendOverlayVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendOverlayVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})