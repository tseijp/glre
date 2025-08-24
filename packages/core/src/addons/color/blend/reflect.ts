import { Fn, Float, Vec3, vec3, min, select } from '../../../node'

export const blendReflect = Fn(([base, blend]: [Float, Float]): Float => {
        return select(blend, min(base.mul(base).div(blend.oneMinus()), 1), blend.equal(1))
}).setLayout({
        name: 'blendReflect',
        type: 'float',
        inputs: [
                { name: 'base', type: 'float' },
                { name: 'blend', type: 'float' },
        ],
})

export const blendReflectVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        return vec3(blendReflect(base.r, blend.r), blendReflect(base.g, blend.g), blendReflect(base.b, blend.b))
}).setLayout({
        name: 'blendReflectVec3',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
        ],
})

export const blendReflectVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendReflectVec3(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendReflectVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' },
        ],
})
