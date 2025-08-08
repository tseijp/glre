import { Fn, Vec3, Vec4, float, vec4 } from '../../../node'
import { hue2rgb } from './hue2rgb'

export const hsl2rgb = Fn(([hsl]: [Vec3]): Vec3 => {
        const rgb = hue2rgb(hsl.x).toVar()
        const C = float(1).sub(hsl.z.mul(2).sub(1).abs()).mul(hsl.y).toVar()
        return rgb.sub(0.5).mul(C).add(hsl.z)
}).setLayout({
        name: 'hsl2rgb',
        type: 'vec3',
        inputs: [{ name: 'hsl', type: 'vec3' }],
})

export const hsl2rgbVec4 = Fn(([hsl]: [Vec4]): Vec4 => {
        return vec4(hsl2rgb(hsl.xyz), hsl.w)
}).setLayout({
        name: 'hsl2rgbVec4',
        type: 'vec4',
        inputs: [{ name: 'hsl', type: 'vec4' }],
})
