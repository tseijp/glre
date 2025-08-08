import { Fn, Vec3, Vec4, float, vec3, vec4, select } from '../../../node'

const HCV_EPSILON = float('1e-10').constant()

export const rgb2hcv = Fn(([rgb]: [Vec3]): Vec3 => {
        const P_true = vec4(rgb.b, rgb.g, -1, float(2).div(3)).toVar()
        const P_false = vec4(rgb.g, rgb.b, 0, float(-1).div(3)).toVar()
        const P_final = select(P_true, P_false, rgb.g.lessThan(rgb.b)).toVar()

        const Q_true = vec4(P_final.x, P_final.y, P_final.w, rgb.r).toVar()
        const Q_false = vec4(rgb.r, P_final.y, P_final.z, P_final.x).toVar()
        const Q_final = select(Q_true, Q_false, rgb.r.lessThan(P_final.x)).toVar()

        const C = Q_final.x.sub(Q_final.w.min(Q_final.y)).toVar()
        const H = Q_final.w.sub(Q_final.y).div(float(6).mul(C).add(HCV_EPSILON)).add(Q_final.z).abs().toVar()
        return vec3(H, C, Q_final.x)
}).setLayout({
        name: 'rgb2hcv',
        type: 'vec3',
        inputs: [{ name: 'rgb', type: 'vec3' }],
})

export const rgb2hcvVec4 = Fn(([rgb]: [Vec4]): Vec4 => {
        return vec4(rgb2hcv(rgb.xyz), rgb.w)
}).setLayout({
        name: 'rgb2hcvVec4',
        type: 'vec4',
        inputs: [{ name: 'rgb', type: 'vec4' }],
})
