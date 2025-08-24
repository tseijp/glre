import { Fn, Float, Vec3, Vec4, vec4 } from '../../../node'

const compositeSourceInFloat = Fn(([src, dst]: [Float, Float]): Float => {
        return src.mul(dst)
}).setLayout({
        name: 'compositeSourceIn',
        type: 'float',
        inputs: [
                { name: 'src', type: 'float' },
                { name: 'dst', type: 'float' }
        ]
})

export const compositeSourceIn = compositeSourceInFloat

export const compositeSourceInVec3 = Fn(([srcColor, dstColor, srcAlpha, dstAlpha]: [Vec3, Vec3, Float, Float]): Vec3 => {
        return srcColor.mul(dstAlpha)
}).setLayout({
        name: 'compositeSourceInVec3',
        type: 'vec3',
        inputs: [
                { name: 'srcColor', type: 'vec3' },
                { name: 'dstColor', type: 'vec3' },
                { name: 'srcAlpha', type: 'float' },
                { name: 'dstAlpha', type: 'float' }
        ]
})

export const compositeSourceInVec4 = Fn(([srcColor, dstColor]: [Vec4, Vec4]): Vec4 => {
        const resultRgb = compositeSourceInVec3(srcColor.rgb, dstColor.rgb, srcColor.a, dstColor.a)
        const resultA = compositeSourceInFloat(srcColor.a, dstColor.a)
        return vec4(resultRgb, resultA)
}).setLayout({
        name: 'compositeSourceInVec4',
        type: 'vec4',
        inputs: [
                { name: 'srcColor', type: 'vec4' },
                { name: 'dstColor', type: 'vec4' }
        ]
})