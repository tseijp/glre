import { Fn, Float, Vec3, Vec4, vec4 } from '../../../node'

const compositeSourceAtopFloat = Fn(([src, dst]: [Float, Float]): Float => {
        return src.mul(dst).add(dst.mul(src.oneMinus()))
}).setLayout({
        name: 'compositeSourceAtop',
        type: 'float',
        inputs: [
                { name: 'src', type: 'float' },
                { name: 'dst', type: 'float' },
        ],
})

export const compositeSourceAtop = compositeSourceAtopFloat

export const compositeSourceAtopVec3 = Fn(
        ([srcColor, dstColor, srcAlpha, dstAlpha]: [Vec3, Vec3, Float, Float]): Vec3 => {
                return srcColor.mul(dstAlpha).add(dstColor.mul(srcAlpha.oneMinus()))
        }
).setLayout({
        name: 'compositeSourceAtopVec3',
        type: 'vec3',
        inputs: [
                { name: 'srcColor', type: 'vec3' },
                { name: 'dstColor', type: 'vec3' },
                { name: 'srcAlpha', type: 'float' },
                { name: 'dstAlpha', type: 'float' },
        ],
})

export const compositeSourceAtopVec4 = Fn(([srcColor, dstColor]: [Vec4, Vec4]): Vec4 => {
        const resultRgb = compositeSourceAtopVec3(srcColor.rgb, dstColor.rgb, srcColor.a, dstColor.a)
        const resultA = compositeSourceAtopFloat(srcColor.a, dstColor.a)
        return vec4(resultRgb, resultA)
}).setLayout({
        name: 'compositeSourceAtopVec4',
        type: 'vec4',
        inputs: [
                { name: 'srcColor', type: 'vec4' },
                { name: 'dstColor', type: 'vec4' },
        ],
})
