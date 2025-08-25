import { Fn, Float, Vec3, Vec4, vec4 } from '../../../node'

const compositeXorFloat = Fn(([src, dst]: [Float, Float]): Float => {
        return src.mul(dst.oneMinus()).add(dst.mul(src.oneMinus()))
}).setLayout({
        name: 'compositeXor',
        type: 'float',
        inputs: [
                { name: 'src', type: 'float' },
                { name: 'dst', type: 'float' },
        ],
})

export const compositeXor = compositeXorFloat

export const compositeXorVec3 = Fn(([srcColor, dstColor, srcAlpha, dstAlpha]: [Vec3, Vec3, Float, Float]): Vec3 => {
        return srcColor.mul(dstAlpha.oneMinus()).add(dstColor.mul(srcAlpha.oneMinus()))
}).setLayout({
        name: 'compositeXorVec3',
        type: 'vec3',
        inputs: [
                { name: 'srcColor', type: 'vec3' },
                { name: 'dstColor', type: 'vec3' },
                { name: 'srcAlpha', type: 'float' },
                { name: 'dstAlpha', type: 'float' },
        ],
})

export const compositeXorVec4 = Fn(([srcColor, dstColor]: [Vec4, Vec4]): Vec4 => {
        const resultRgb = compositeXorVec3(srcColor.rgb, dstColor.rgb, srcColor.a, dstColor.a)
        const resultA = compositeXorFloat(srcColor.a, dstColor.a)
        return vec4(resultRgb, resultA)
}).setLayout({
        name: 'compositeXorVec4',
        type: 'vec4',
        inputs: [
                { name: 'srcColor', type: 'vec4' },
                { name: 'dstColor', type: 'vec4' },
        ],
})
