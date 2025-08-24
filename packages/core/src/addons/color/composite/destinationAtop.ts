import { Fn, Float, Vec3, Vec4, vec4 } from '../../../node'

const compositeDestinationAtopFloat = Fn(([src, dst]: [Float, Float]): Float => {
        return dst.mul(src).add(src.mul(dst.oneMinus()))
}).setLayout({
        name: 'compositeDestinationAtop',
        type: 'float',
        inputs: [
                { name: 'src', type: 'float' },
                { name: 'dst', type: 'float' },
        ],
})

export const compositeDestinationAtop = compositeDestinationAtopFloat

export const compositeDestinationAtopVec3 = Fn(
        ([srcColor, dstColor, srcAlpha, dstAlpha]: [Vec3, Vec3, Float, Float]): Vec3 => {
                return dstColor.mul(srcAlpha).add(srcColor.mul(dstAlpha.oneMinus()))
        }
).setLayout({
        name: 'compositeDestinationAtopVec3',
        type: 'vec3',
        inputs: [
                { name: 'srcColor', type: 'vec3' },
                { name: 'dstColor', type: 'vec3' },
                { name: 'srcAlpha', type: 'float' },
                { name: 'dstAlpha', type: 'float' },
        ],
})

export const compositeDestinationAtopVec4 = Fn(([srcColor, dstColor]: [Vec4, Vec4]): Vec4 => {
        const resultRgb = compositeDestinationAtopVec3(srcColor.rgb, dstColor.rgb, srcColor.a, dstColor.a)
        const resultA = compositeDestinationAtopFloat(srcColor.a, dstColor.a)
        return vec4(resultRgb, resultA)
}).setLayout({
        name: 'compositeDestinationAtopVec4',
        type: 'vec4',
        inputs: [
                { name: 'srcColor', type: 'vec4' },
                { name: 'dstColor', type: 'vec4' },
        ],
})
