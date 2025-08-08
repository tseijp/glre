import { Fn, X, select } from '../../../node'

export const quadraticInOut = Fn(([t]: [X]): X => {
        const p = t.mul(t).mul(2)
        return select(p, p.negate().add(t.mul(4)).sub(1), t.lessThan(0.5))
}).setLayout({
        name: 'quadraticInOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
