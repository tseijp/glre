import { Fn, Float, Vec3 } from '../../../node'

export const blendExclusion = Fn(([base, blend]: [Float, Float]): Float => {
        return base.add(blend).sub(base.mul(blend).mul(2))
}).setLayout({
        name: 'blendExclusion',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' }
        ]
})

export const blendExclusionVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return base.add(blend).sub(base.mul(blend).mul(2))
}).setLayout({
        name: 'blendExclusionVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendExclusionVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendExclusionVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendExclusionVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})