import { Fn, X, float } from '../../node'

export const inverse = Fn(([m]: [X]): X => {
        return float(1).div(m)
}).setLayout({
        name: 'reciprocal',
        type: 'auto',
        inputs: [{ name: 'm', type: 'auto' }],
})
