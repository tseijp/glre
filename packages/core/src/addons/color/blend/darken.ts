import { Fn, Float, Vec3, vec3, min } from '../../../node'

export const blendDarken = Fn(([base, blend]: [Float, Float]): Float => {
        return min(blend, base)
}).setLayout({
        name: 'blendDarken',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' },
        ],
})

export const blendDarkenVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(blendDarken(base.r, blend.r), blendDarken(base.g, blend.g), blendDarken(base.b, blend.b))
}).setLayout({
        name: 'blendDarkenVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
        ],
})

export const blendDarkenVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendDarkenVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendDarkenVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' },
        ],
})
