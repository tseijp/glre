import { Fn, Float, Vec3, vec3, min } from '../../../node'

export const blendLinearDodge = Fn(([base, blend]: [Float, Float]): Float => {
        return min(base.add(blend), 1)
}).setLayout({
        name: 'blendLinearDodge',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' },
        ],
})

export const blendLinearDodgeVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(
                blendLinearDodge(base.r, blend.r),
                blendLinearDodge(base.g, blend.g),
                blendLinearDodge(base.b, blend.b)
        )
}).setLayout({
        name: 'blendLinearDodgeVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
        ],
})

export const blendLinearDodgeVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendLinearDodgeVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendLinearDodgeVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' },
        ],
})
