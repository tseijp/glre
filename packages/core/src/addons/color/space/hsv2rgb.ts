import { Fn, Vec3, Vec4, vec4 } from '../../../node'
import { hue2rgb } from './hue2rgb'

export const hsv2rgb = Fn(([hsv]: [Vec3]): Vec3 => {
        return hue2rgb(hsv.x).sub(1).mul(hsv.y).add(1).mul(hsv.z)
}).setLayout({
        name: 'hsv2rgb',
        type: 'vec3',
        inputs: [{ name: 'hsv', type: 'vec3' }],
})

export const hsv2rgbVec4 = Fn(([hsv]: [Vec4]): Vec4 => {
        return vec4(hsv2rgb(hsv.xyz), hsv.w)
}).setLayout({
        name: 'hsv2rgbVec4',
        type: 'vec4',
        inputs: [{ name: 'hsv', type: 'vec4' }],
})
