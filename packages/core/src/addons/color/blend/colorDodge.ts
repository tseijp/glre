import { Fn, Float, Vec3, vec3, min, select } from '../../../node'

export const blendColorDodge = Fn(([base, blend]: [Float, Float]): Float => {
        return select(blend, min(base.div(blend.oneMinus()), 1), blend.equal(1))
}).setLayout({
        name: 'blendColorDodge',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' },
        ],
})

export const blendColorDodgeVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(
                blendColorDodge(base.r, blend.r),
                blendColorDodge(base.g, blend.g),
                blendColorDodge(base.b, blend.b)
        )
}).setLayout({
        name: 'blendColorDodgeVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
        ],
})

export const blendColorDodgeVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendColorDodgeVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendColorDodgeVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' },
        ],
})
