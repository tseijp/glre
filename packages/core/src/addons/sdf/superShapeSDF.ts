import { Fn, Vec2, Float, vec2, cos, sin, pow, abs, float } from '../../node'
import { cart2polar } from '../space/cart2polar'

export const superShapeSDFCenter = Fn(
        ([st, center, s, a, b, n1, n2, n3, m]: [
                Vec2,
                Vec2,
                Float,
                Float,
                Float,
                Float,
                Float,
                Float,
                Float
        ]): Float => {
                st.assign(st.sub(center))
                const polar = cart2polar(st).toVar('polar')
                const d = polar.y.mul(5).toVar('d')
                const theta = polar.x.toVar('theta')
                const t1 = abs(
                        float(1)
                                .div(a)
                                .mul(cos(m.mul(theta).mul(0.25)))
                ).toVar('t1')
                t1.assign(pow(t1, n2))
                const t2 = abs(
                        float(1)
                                .div(b)
                                .mul(sin(m.mul(theta).mul(0.25)))
                ).toVar('t2')
                t2.assign(pow(t2, n3))
                const t3 = t1.add(t2).toVar('t3')
                const r = pow(t3, float(-1).div(n1)).toVar('r')
                const q = s
                        .mul(r)
                        .mul(vec2(cos(theta), sin(theta)))
                        .toVar('q')
                return d.sub(q.length())
        }
).setLayout({
        name: 'superShapeSDFCenter',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'center', type: 'vec2' },
                { name: 's', type: 'float' },
                { name: 'a', type: 'float' },
                { name: 'b', type: 'float' },
                { name: 'n1', type: 'float' },
                { name: 'n2', type: 'float' },
                { name: 'n3', type: 'float' },
                { name: 'm', type: 'float' },
        ],
})

export const superShapeSDF = Fn(
        ([st, s, a, b, n1, n2, n3, m]: [Vec2, Float, Float, Float, Float, Float, Float, Float]): Float => {
                return superShapeSDFCenter(st, vec2(0.5), s, a, b, n1, n2, n3, m)
        }
).setLayout({
        name: 'superShapeSDF',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 's', type: 'float' },
                { name: 'a', type: 'float' },
                { name: 'b', type: 'float' },
                { name: 'n1', type: 'float' },
                { name: 'n2', type: 'float' },
                { name: 'n3', type: 'float' },
                { name: 'm', type: 'float' },
        ],
})
