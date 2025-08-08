import { Fn, X, select } from '../../../node'

export const quinticInOut = Fn(([t]: [X]): X => {
        const early = t.pow(5).mul(16)
        const late = t.mul(2).sub(2).pow(5).mul(-0.5).add(1)
        return select(early, late, t.lessThan(0.5))
}).setLayout({
        name: 'quinticInOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})