import { Fn, Vec3, Vec4, float, vec3, vec4 } from '../../../node'
import { rgb2hcv } from './rgb2hcv'

const HSL_EPSILON = float('1e-10')

export const rgb2hsl = Fn(([rgb]: [Vec3]): Vec3 => {
        const HCV = rgb2hcv(rgb).toVar()
        const L = HCV.z.sub(HCV.y.mul(0.5)).toVar()
        const S = HCV.y.div(float(1).sub(L.mul(2).sub(1).abs()).add(HSL_EPSILON)).toVar()
        return vec3(HCV.x, S, L)
}).setLayout({
        name: 'rgb2hsl',
        type: 'vec3',
        inputs: [{ name: 'rgb', type: 'vec3' }],
})

export const rgb2hslVec4 = Fn(([rgb]: [Vec4]): Vec4 => {
        return vec4(rgb2hsl(rgb.xyz), rgb.w)
}).setLayout({
        name: 'rgb2hslVec4',
        type: 'vec4',
        inputs: [{ name: 'rgb', type: 'vec4' }],
})
