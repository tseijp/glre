import { Fn, Float, Vec3, Vec4, vec4 } from '../../../node'

const compositeDestinationInFloat = Fn(([src, dst]: [Float, Float]): Float => {
        return dst.mul(src)
}).setLayout({
        name: 'compositeDestinationIn',
        type: 'float',
        inputs: [
                { name: 'src', type: 'float' },
                { name: 'dst', type: 'float' },
        ],
})

export const compositeDestinationIn = compositeDestinationInFloat

export const compositeDestinationInVec3 = Fn(
        ([srcColor, dstColor, srcAlpha, dstAlpha]: [Vec3, Vec3, Float, Float]): Vec3 => {
                return dstColor.mul(srcAlpha)
        }
).setLayout({
        name: 'compositeDestinationInVec3',
        type: 'vec3',
        inputs: [
                { name: 'srcColor', type: 'vec3' },
                { name: 'dstColor', type: 'vec3' },
                { name: 'srcAlpha', type: 'float' },
                { name: 'dstAlpha', type: 'float' },
        ],
})

export const compositeDestinationInVec4 = Fn(([srcColor, dstColor]: [Vec4, Vec4]): Vec4 => {
        const resultRgb = compositeDestinationInVec3(srcColor.rgb, dstColor.rgb, srcColor.a, dstColor.a)
        const resultA = compositeDestinationInFloat(srcColor.a, dstColor.a)
        return vec4(resultRgb, resultA)
}).setLayout({
        name: 'compositeDestinationInVec4',
        type: 'vec4',
        inputs: [
                { name: 'srcColor', type: 'vec4' },
                { name: 'dstColor', type: 'vec4' },
        ],
})
