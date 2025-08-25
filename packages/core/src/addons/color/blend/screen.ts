import { Fn, Float, Vec3, vec3, float } from '../../../node'

export const blendScreenFloat = Fn(([base, blend]: [Float, Float]): Float => {
        return float(1).sub(float(1).sub(base).mul(float(1).sub(blend)))
}).setLayout({
        name: 'blendScreenFloat',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' },
        ],
})

export const blendScreen = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(
                blendScreenFloat(base.x, blend.x),
                blendScreenFloat(base.y, blend.y),
                blendScreenFloat(base.z, blend.z)
        )
}).setLayout({
        name: 'blendScreen',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
        ],
})

export const blendScreenOpacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendScreen(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendScreenOpacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' },
        ],
})
