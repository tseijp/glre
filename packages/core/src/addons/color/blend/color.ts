import { Fn, Float, Vec3, vec3 } from '../../../node'
import { rgb2hsv } from '../space/rgb2hsv'
import { hsv2rgb } from '../space/hsv2rgb'

export const blendColor = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
        const baseHSV = rgb2hsv(base).toVar('baseHSV')
        const blendHSV = rgb2hsv(blend).toVar('blendHSV')
        return hsv2rgb(vec3(blendHSV.x, blendHSV.y, baseHSV.z))
}).setLayout({
        name: 'blendColor',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' }
        ]
})

export const blendColorOpacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
        return blendColor(base, blend).mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
        name: 'blendColorOpacity',
        type: 'vec3',
        inputs: [
                { name: 'base', type: 'vec3' },
                { name: 'blend', type: 'vec3' },
                { name: 'opacity', type: 'float' }
        ]
})