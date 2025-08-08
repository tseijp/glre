import { Fn, X, select } from '../../../node'

export const exponentialInOut = Fn(([t]: [X]): X => {
        const isZeroOrOne = t.equal(0).or(t.equal(1))
        const early = t.mul(20).sub(10).exp2().mul(0.5)
        const late = t.mul(-20).add(10).exp2().mul(-0.5).add(1)
        const result = select(late, early, t.lessThan(0.5))
        return select(result, t, isZeroOrOne)
}).setLayout({
        name: 'exponentialInOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})