import { Fn, Vec3, Vec4, vec4 } from '../../../node'
import { lch2lab } from './lch2lab'
import { lab2rgb } from './lab2rgb'

export const lch2rgb3 = Fn(([lch]: [Vec3]): Vec3 => {
        return lab2rgb(lch2lab(lch))
}).setLayout({
        name: 'lch2rgb3',
        type: 'vec3',
        inputs: [{ name: 'lch', type: 'vec3' }],
})

export const lch2rgb4 = Fn(([lch]: [Vec4]): Vec4 => {
        const rgb = lch2rgb3(lch.xyz)
        return vec4(rgb, lch.w)
}).setLayout({
        name: 'lch2rgb4',
        type: 'vec4',
        inputs: [{ name: 'lch', type: 'vec4' }],
})

export const lch2rgb = lch2rgb3
