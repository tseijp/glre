import { Fn, Vec3, Vec4, vec4 } from '../../../node'
import { rgb2lab } from './rgb2lab'
import { lab2lch } from './lab2lch'

export const rgb2lch3 = Fn(([rgb]: [Vec3]): Vec3 => {
        return lab2lch(rgb2lab(rgb))
}).setLayout({
        name: 'rgb2lch3',
        type: 'vec3',
        inputs: [{ name: 'rgb', type: 'vec3' }],
})

export const rgb2lch4 = Fn(([rgb]: [Vec4]): Vec4 => {
        const lch = rgb2lch3(rgb.xyz)
        return vec4(lch, rgb.w)
}).setLayout({
        name: 'rgb2lch4',
        type: 'vec4',
        inputs: [{ name: 'rgb', type: 'vec4' }],
})

export const rgb2lch = rgb2lch3
