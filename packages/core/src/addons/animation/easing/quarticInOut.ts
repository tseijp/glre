import { Fn, X, select } from '../../../node'

export const quarticInOut = Fn(([t]: [X]): X => {
        const early = t.pow(4).mul(8)
        const late = t.sub(1).pow(4).mul(-8).add(1)
        return select(early, late, t.lessThan(0.5))
}).setLayout({
        name: 'quarticInOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})