import { Fn, Vec2, Float, Int, atan2 } from '../../node'
import { PI, TAU } from '../math/const'

export const polySDF = Fn(([st, V]: [Vec2, Int]): Float => {
        const p = st.mul(2).sub(1).toVar('p')
        const a = atan2(p.y, p.x).add(PI).toVar('a')
        const r = p.length().toVar('r')
        const v = TAU.div(V.toFloat()).toVar('v')
        return a.div(v).add(0.5).floor().mul(v).sub(a).cos().mul(r)
}).setLayout({
        name: 'polySDF',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'V', type: 'int' }
        ]
})

export const polySDFFloat = Fn(([st, V]: [Vec2, Float]): Float => {
        const p = st.mul(2).sub(1).toVar('p')
        const a = atan2(p.y, p.x).add(PI).toVar('a')
        const r = p.length().toVar('r')
        const v = TAU.div(V).toVar('v')
        return a.div(v).add(0.5).floor().mul(v).sub(a).cos().mul(r)
}).setLayout({
        name: 'polySDFFloat',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'V', type: 'float' }
        ]
})