import { Fn, Vec3, Vec4, vec4 } from '../../../node'
import { rgb2xyz } from './rgb2xyz'
import { xyz2lab } from './xyz2lab'

export const rgb2lab = Fn(([rgb]: [Vec3]): Vec3 => {
        return xyz2lab(rgb2xyz(rgb))
}).setLayout({
        name: 'rgb2lab',
        type: 'vec3',
        inputs: [{ name: 'rgb', type: 'vec3' }],
})

export const rgb2labVec4 = Fn(([rgb]: [Vec4]): Vec4 => {
        return vec4(rgb2lab(rgb.xyz), rgb.w)
}).setLayout({
        name: 'rgb2labVec4',
        type: 'vec4',
        inputs: [{ name: 'rgb', type: 'vec4' }],
})