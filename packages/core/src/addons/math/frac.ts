import { Fn, X } from '../../node'

export const frac = Fn(([x]: [X]): X => {
        return x.fract()
}).setLayout({
        name: 'frac',
        type: 'auto',
        inputs: [{ name: 'x', type: 'auto' }],
})
