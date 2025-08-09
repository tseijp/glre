import { Fn, X } from '../../../node'

export const exponentialInOut = Fn(([t]: [X]): X => {
        const isZeroOrOne = t.equal(0).or(t.equal(1))
        const early = t.mul(20).sub(10).exp2().mul(0.5)
        const late = t.mul(-20).add(10).exp2().mul(-0.5).add(1)
        const result = (early as any).select(late, t.lessThan(0.5))
        return (t as any).select(result, isZeroOrOne)
}).setLayout({
        name: 'exponentialInOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
