import { Fn, Float, Vec3, abs } from '../../../node'

export const blendDifference = Fn(([base, blend]: [Float, Float]): Float => {
        return abs(base.sub(blend))
}).setLayout({
        name: 'blendDifference',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' }
        ]
})

export const blendDifferenceVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return abs(base.sub(blend))
}).setLayout({
        name: 'blendDifferenceVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendDifferenceVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendDifferenceVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendDifferenceVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})