import { Fn, Vec3, Vec4, float, vec3, vec4, step, mix } from '../../../node'

export const xyz2lab = Fn(([xyz]: [Vec3]): Vec3 => {
        const n = xyz.div(vec3(95.047, 100, 108.883)).toVar()
        const c0 = n.pow(vec3(1.0 / 3.0)).toVar()
        const c1 = n.mul(7.787).add(16.0 / 116.0).toVar()
        const v = mix(c0, c1, step(n, vec3(0.008856))).toVar()
        const L = v.y.mul(116).sub(16).toVar()
        const A = v.x.sub(v.y).mul(500).toVar()
        const B = v.y.sub(v.z).mul(200).toVar()
        return vec3(L, A, B)
}).setLayout({
        name: 'xyz2lab',
        type: 'vec3',
        inputs: [{ name: 'xyz', type: 'vec3' }],
})

export const xyz2labVec4 = Fn(([xyz]: [Vec4]): Vec4 => {
        return vec4(xyz2lab(xyz.xyz), xyz.w)
}).setLayout({
        name: 'xyz2labVec4',
        type: 'vec4',
        inputs: [{ name: 'xyz', type: 'vec4' }],
})