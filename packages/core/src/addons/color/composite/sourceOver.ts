import { Fn, Float, Vec3, Vec4, vec4 } from '../../../node'

const compositeSourceOverFloat = Fn(([src, dst]: [Float, Float]): Float => {
        return src.add(dst.mul(src.oneMinus()))
}).setLayout({
        name: 'compositeSourceOver',
        type: 'float',
        inputs: [
                { name: 'src', type: 'float' },
                { name: 'dst', type: 'float' }
        ]
})

export const compositeSourceOver = compositeSourceOverFloat

export const compositeSourceOverVec3 = Fn(([srcColor, dstColor, srcAlpha, dstAlpha]: [Vec3, Vec3, Float, Float]): Vec3 => {
        return srcColor.mul(srcAlpha).add(dstColor.mul(dstAlpha).mul(srcAlpha.oneMinus()))
}).setLayout({
        name: 'compositeSourceOverVec3',
        type: 'vec3',
        inputs: [
                { name: 'srcColor', type: 'vec3' },
                { name: 'dstColor', type: 'vec3' },
                { name: 'srcAlpha', type: 'float' },
                { name: 'dstAlpha', type: 'float' }
        ]
})

export const compositeSourceOverVec4 = Fn(([srcColor, dstColor]: [Vec4, Vec4]): Vec4 => {
        const resultRgb = compositeSourceOverVec3(srcColor.rgb, dstColor.rgb, srcColor.a, dstColor.a)
        const resultA = compositeSourceOverFloat(srcColor.a, dstColor.a)
        return vec4(resultRgb, resultA)
}).setLayout({
        name: 'compositeSourceOverVec4',
        type: 'vec4',
        inputs: [
                { name: 'srcColor', type: 'vec4' },
                { name: 'dstColor', type: 'vec4' }
        ]
})