import { Fn, Float, Vec3, vec3, max } from '../../../node'

export const blendLinearBurn = Fn(([base, blend]: [Float, Float]): Float => {
        return max(base.add(blend).sub(1), 0)
}).setLayout({
        name: 'blendLinearBurn',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' }
        ]
})

export const blendLinearBurnVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(
                blendLinearBurn(base.r, blend.r),
                blendLinearBurn(base.g, blend.g),
                blendLinearBurn(base.b, blend.b)
        )
}).setLayout({
        name: 'blendLinearBurnVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendLinearBurnVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendLinearBurnVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendLinearBurnVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})