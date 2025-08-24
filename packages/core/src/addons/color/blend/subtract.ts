import { Fn, Float, Vec3, max, vec3 } from '../../../node'

const blendSubtractFloat = Fn(([base, blend]: [Float, Float]): Float => {
        return max(base.add(blend).sub(1), 0)
}).setLayout({
        name: 'blendSubtract',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' }
        ]
})

export const blendSubtract = blendSubtractFloat

export const blendSubtractVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return max(base.add(blend).sub(vec3(1)), vec3(0))
}).setLayout({
        name: 'blendSubtractVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendSubtractVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendSubtractVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendSubtractVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})