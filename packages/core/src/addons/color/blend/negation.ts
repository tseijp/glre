import { Fn, Float, Vec3, vec3, abs, float } from '../../../node'

export const blendNegation = Fn(([base, blend]: [Float, Float]): Float => {
        return float(1).sub(abs(float(1).sub(base).sub(blend)))
}).setLayout({
        name: 'blendNegation',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' }
        ]
})

export const blendNegationVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(1).sub(abs(vec3(1).sub(base).sub(blend)))
}).setLayout({
        name: 'blendNegationVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendNegationVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendNegationVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendNegationVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})