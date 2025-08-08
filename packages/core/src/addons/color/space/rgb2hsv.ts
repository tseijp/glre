import { Fn, Vec3, Vec4, float, vec3, vec4, select } from '../../../node'

const HCV_EPSILON = float('1e-10')

export const rgb2hsv = Fn(([c]: [Vec3]): Vec3 => {
        const K = vec4(0, float(-1).div(3), float(2).div(3), -1).toVar()
        const P_true = vec4(c.b, c.g, K.w, K.z).toVar()
        const P_false = vec4(c.g, c.b, K.x, K.y).toVar()
        const P = select(P_true, P_false, c.g.lessThan(c.b)).toVar()

        const Q_true = vec4(P.x, P.y, P.w, c.r).toVar()
        const Q_false = vec4(c.r, P.y, P.z, P.x).toVar()
        const Q = select(Q_true, Q_false, c.r.lessThan(P.x)).toVar()

        const d = Q.x.sub(Q.w.min(Q.y)).toVar()
        const H = Q.z
                .add(Q.w.sub(Q.y).div(float(6).mul(d).add(HCV_EPSILON)))
                .abs()
                .toVar()
        const S = d.div(Q.x.add(HCV_EPSILON)).toVar()
        const V = Q.x.toVar()

        return vec3(H, S, V)
}).setLayout({
        name: 'rgb2hsv',
        type: 'vec3',
        inputs: [{ name: 'c', type: 'vec3' }],
})

export const rgb2hsvVec4 = Fn(([c]: [Vec4]): Vec4 => {
        return vec4(rgb2hsv(c.xyz), c.w)
}).setLayout({
        name: 'rgb2hsvVec4',
        type: 'vec4',
        inputs: [{ name: 'c', type: 'vec4' }],
})
