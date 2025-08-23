import { Fn, Float, Vec3, min, vec3 } from '../../../node'

export const blendAdd = Fn(([base, blend]: [Float, Float]): Float => {
        return min(base.add(blend), 1)
}).setLayout({
        name: 'blendAdd',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' }
        ]
})

export const blendAddVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return min(base.add(blend), vec3(1))
}).setLayout({
        name: 'blendAddVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendAddVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendAddVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendAddVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})