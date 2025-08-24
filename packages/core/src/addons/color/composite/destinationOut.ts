import { Fn, Float, Vec3, Vec4, vec4 } from '../../../node'

const compositeDestinationOutFloat = Fn(([src, dst]: [Float, Float]): Float => {
        return dst.mul(src.oneMinus())
}).setLayout({
        name: 'compositeDestinationOut',
        type: 'float',
        inputs: [
                { name: 'src', type: 'float' },
                { name: 'dst', type: 'float' },
        ],
})

export const compositeDestinationOut = compositeDestinationOutFloat

export const compositeDestinationOutVec3 = Fn(
        ([_srcColor, dstColor, srcAlpha, _dstAlpha]: [Vec3, Vec3, Float, Float]): Vec3 => {
                return dstColor.mul(srcAlpha.oneMinus())
        }
).setLayout({
        name: 'compositeDestinationOutVec3',
        type: 'vec3',
        inputs: [
                { name: 'srcColor', type: 'vec3' },
                { name: 'dstColor', type: 'vec3' },
                { name: 'srcAlpha', type: 'float' },
                { name: 'dstAlpha', type: 'float' },
        ],
})

export const compositeDestinationOutVec4 = Fn(([srcColor, dstColor]: [Vec4, Vec4]): Vec4 => {
        const resultRgb = compositeDestinationOutVec3(srcColor.rgb, dstColor.rgb, srcColor.a, dstColor.a)
        const resultA = compositeDestinationOutFloat(srcColor.a, dstColor.a)
        return vec4(resultRgb, resultA)
}).setLayout({
        name: 'compositeDestinationOutVec4',
        type: 'vec4',
        inputs: [
                { name: 'srcColor', type: 'vec4' },
                { name: 'dstColor', type: 'vec4' },
        ],
})
