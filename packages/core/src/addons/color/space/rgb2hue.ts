import { Fn, Vec3, Vec4, Float, float, vec4, select } from '../../../node'

const HUE_EPSILON = float('1e-10')

export const rgb2hue = Fn(([c]: [Vec3]): Float => {
        const K = vec4(0, float(-1).div(3), float(2).div(3), -1).toVar()
        const P_true = vec4(c.b, c.g, K.w, K.z).toVar()
        const P_false = vec4(c.g, c.b, K.x, K.y).toVar()
        const P = select(P_true, P_false, c.g.lessThan(c.b)).toVar()

        const Q_true = vec4(P.x, P.y, P.w, c.r).toVar()
        const Q_false = vec4(c.r, P.y, P.z, P.x).toVar()
        const Q = select(Q_true, Q_false, c.r.lessThan(P.x)).toVar()

        const d = Q.x.sub(Q.w.min(Q.y)).toVar()
        return Q.z.add(Q.w.sub(Q.y).div(float(6).mul(d).add(HUE_EPSILON))).abs()
}).setLayout({
        name: 'rgb2hue',
        type: 'float',
        inputs: [{ name: 'c', type: 'vec3' }],
})

export const rgb2hueVec4 = Fn(([c]: [Vec4]): Float => {
        return rgb2hue(c.xyz)
}).setLayout({
        name: 'rgb2hueVec4',
        type: 'float',
        inputs: [{ name: 'c', type: 'vec4' }],
})
