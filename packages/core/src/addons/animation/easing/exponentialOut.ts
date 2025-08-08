import { Fn, X, select } from '../../../node'

export const exponentialOut = Fn(([t]: [X]): X => {
        return select(t.mul(-10).exp2().negate().add(1), t, t.equal(1))
}).setLayout({
        name: 'exponentialOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})