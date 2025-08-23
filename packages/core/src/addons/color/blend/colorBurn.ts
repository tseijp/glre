import { Fn, Float, Vec3, vec3, max, select } from '../../../node'

export const blendColorBurn = Fn(([base, blend]: [Float, Float]): Float => {
        return select(blend, max(base.div(blend.oneMinus()).oneMinus(), 0), blend.equal(0))
}).setLayout({
        name: 'blendColorBurn',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' }
        ]
})

export const blendColorBurnVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(
                blendColorBurn(base.r, blend.r),
                blendColorBurn(base.g, blend.g),
                blendColorBurn(base.b, blend.b)
        )
}).setLayout({
        name: 'blendColorBurnVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendColorBurnVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendColorBurnVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendColorBurnVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})