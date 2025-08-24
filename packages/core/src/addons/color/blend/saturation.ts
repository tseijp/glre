import { Fn, Vec3, Float, vec3 } from '../../../node'
import { rgb2hsv } from '../space/rgb2hsv'
import { hsv2rgb } from '../space/hsv2rgb'

export const blendSaturation = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        const baseHSV = rgb2hsv(base)
        const blendHSV = rgb2hsv(blend)
        return hsv2rgb(vec3(baseHSV.x, blendHSV.y, baseHSV.z))
}).setLayout({
        name: 'blendSaturation',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
        ],
})

export const blendSaturationOpacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendSaturation(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendSaturationOpacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' },
        ],
})
