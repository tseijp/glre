import { Fn, X, select } from '../../../node'

export const cubicInOut = Fn(([t]: [X]): X => {
        const early = t.mul(t).mul(t).mul(4)
        const late = t.mul(2).sub(2).pow(3).mul(0.5).add(1)
        return select(late, early, t.lessThan(0.5))
}).setLayout({
        name: 'cubicInOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
