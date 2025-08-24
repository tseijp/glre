import { Fn, Float, Vec3, Vec4, vec4 } from '../../../node'

const compositeDestinationOverFloat = Fn(([src, dst]: [Float, Float]): Float => {
        return dst.add(src.mul(dst.oneMinus()))
}).setLayout({
        name: 'compositeDestinationOver',
        type: 'float',
        inputs: [
                { name: 'src', type: 'float' },
                { name: 'dst', type: 'float' },
        ],
})

export const compositeDestinationOver = compositeDestinationOverFloat

export const compositeDestinationOverVec3 = Fn(
        ([srcColor, dstColor, srcAlpha, dstAlpha]: [Vec3, Vec3, Float, Float]): Vec3 => {
                return dstColor.add(srcColor.mul(dstAlpha.oneMinus()))
        }
).setLayout({
        name: 'compositeDestinationOverVec3',
        type: 'vec3',
        inputs: [
                { name: 'srcColor', type: 'vec3' },
                { name: 'dstColor', type: 'vec3' },
                { name: 'srcAlpha', type: 'float' },
                { name: 'dstAlpha', type: 'float' },
        ],
})

export const compositeDestinationOverVec4 = Fn(([srcColor, dstColor]: [Vec4, Vec4]): Vec4 => {
        const resultRgb = compositeDestinationOverVec3(srcColor.rgb, dstColor.rgb, srcColor.a, dstColor.a)
        const resultA = compositeDestinationOverFloat(srcColor.a, dstColor.a)
        return vec4(resultRgb, resultA)
}).setLayout({
        name: 'compositeDestinationOverVec4',
        type: 'vec4',
        inputs: [
                { name: 'srcColor', type: 'vec4' },
                { name: 'dstColor', type: 'vec4' },
        ],
})
