import { Fn, X } from '../../node'

// Square function - computes x^2 with quadratic energy amplification
export const pow2 = Fn(([v]: [X]): X => {
        return v.mul(v)
}).setLayout({
        name: 'pow2',
        type: 'auto',
        inputs: [{ name: 'v', type: 'auto' }],
})
