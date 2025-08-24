import { Fn, Float, Vec3 } from '../../../node'

export const blendAverage = Fn(([base, blend]: [Float, Float]): Float => {
        return base.add(blend).mul(0.5)
}).setLayout({
        name: 'blendAverage',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' },
        ],
})

export const blendAverageVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return base.add(blend).mul(0.5)
}).setLayout({
        name: 'blendAverageVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
        ],
})

export const blendAverageVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendAverageVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendAverageVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' },
        ],
})
