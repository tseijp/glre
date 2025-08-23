import { Fn, Float, Vec3, vec3, min, max, float } from '../../../node'

export const blendPhoenix = Fn(([base, blend]: [Float, Float]): Float => {
        return min(base, blend).sub(max(base, blend)).add(float(1))
}).setLayout({
        name: 'blendPhoenix',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' }
        ]
})

export const blendPhoenixVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return min(base, blend).sub(max(base, blend)).add(vec3(1))
}).setLayout({
        name: 'blendPhoenixVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendPhoenixVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendPhoenixVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendPhoenixVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})