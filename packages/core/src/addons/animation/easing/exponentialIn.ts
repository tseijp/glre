import { Fn, X, select } from '../../../node'

export const exponentialIn = Fn(([t]: [X]): X => {
        return select(t.sub(1).mul(10).exp2(), t, t.equal(0))
}).setLayout({
        name: 'exponentialIn',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})