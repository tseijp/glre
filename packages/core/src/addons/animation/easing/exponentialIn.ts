import { Fn, X } from '../../../node'

export const exponentialIn = Fn(([t]: [X]): X => {
        return (t as any).select(t.sub(1).mul(10).exp2(), t.equal(0))
}).setLayout({
        name: 'exponentialIn',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
