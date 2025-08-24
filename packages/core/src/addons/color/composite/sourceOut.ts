import { Fn, Float, Vec3, Vec4, vec4 } from '../../../node'

const compositeSourceOutFloat = Fn(([src, dst]: [Float, Float]): Float => {
        return src.mul(dst.oneMinus())
}).setLayout({
        name: 'compositeSourceOut',
        type: 'float',
        inputs: [
                { name: 'src', type: 'float' },
                { name: 'dst', type: 'float' }
        ]
})

export const compositeSourceOut = compositeSourceOutFloat

export const compositeSourceOutVec3 = Fn(([srcColor, dstColor, srcAlpha, dstAlpha]: [Vec3, Vec3, Float, Float]): Vec3 => {
        return srcColor.mul(dstAlpha.oneMinus())
}).setLayout({
        name: 'compositeSourceOutVec3',
        type: 'vec3',
        inputs: [
                { name: 'srcColor', type: 'vec3' },
                { name: 'dstColor', type: 'vec3' },
                { name: 'srcAlpha', type: 'float' },
                { name: 'dstAlpha', type: 'float' }
        ]
})

export const compositeSourceOutVec4 = Fn(([srcColor, dstColor]: [Vec4, Vec4]): Vec4 => {
        const resultRgb = compositeSourceOutVec3(srcColor.rgb, dstColor.rgb, srcColor.a, dstColor.a)
        const resultA = compositeSourceOutFloat(srcColor.a, dstColor.a)
        return vec4(resultRgb, resultA)
}).setLayout({
        name: 'compositeSourceOutVec4',
        type: 'vec4',
        inputs: [
                { name: 'srcColor', type: 'vec4' },
                { name: 'dstColor', type: 'vec4' }
        ]
})