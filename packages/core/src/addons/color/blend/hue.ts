import { Fn, Vec3, Float, vec3, clamp } from '../../../node'
import { rgb2hsv } from '../space/rgb2hsv'
import { hsv2rgb } from '../space/hsv2rgb'

export const blendHue = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        const baseHSV = rgb2hsv(base)
        const blendHSV = rgb2hsv(blend)
        const result = vec3(blendHSV.x, baseHSV.y, baseHSV.z)
        return hsv2rgb(result)
}).setLayout({
        name: 'blendHue',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendHueVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendHue(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendHueVec3Opacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})