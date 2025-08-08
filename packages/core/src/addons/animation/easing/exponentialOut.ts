import { Fn, X } from '../../../node'

export const exponentialOut = Fn(([t]: [X]): X => {
        return (t as any).select(t.mul(-10).exp2().negate().add(1), t.equal(1))
}).setLayout({
        name: 'exponentialOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})