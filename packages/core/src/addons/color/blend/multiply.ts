import { Fn, Float, Vec3 } from '../../../node'

export const blendMultiply = Fn(([base, blend]: [Float, Float]): Float => {
        return base.mul(blend)
}).setLayout({
        name: 'blendMultiply',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' }
        ]
})

export const blendMultiplyVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return base.mul(blend)
}).setLayout({
        name: 'blendMultiplyVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendMultiplyVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendMultiplyVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendMultiplyVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})