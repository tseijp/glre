import { Fn, Vec3, Vec4, vec4 } from '../../../node'
import { lab2xyz } from './lab2xyz'
import { xyz2rgb } from './xyz2rgb'

export const lab2rgb = Fn(([lab]: [Vec3]): Vec3 => {
        return xyz2rgb(lab2xyz(lab))
}).setLayout({
        name: 'lab2rgb',
        type: 'vec3',
        inputs: [{ name: 'lab', type: 'vec3' }],
})

export const lab2rgbVec4 = Fn(([lab]: [Vec4]): Vec4 => {
        return vec4(lab2rgb(lab.xyz), lab.w)
}).setLayout({
        name: 'lab2rgbVec4',
        type: 'vec4',
        inputs: [{ name: 'lab', type: 'vec4' }],
})
