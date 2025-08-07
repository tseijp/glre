import { Fn, X } from '../../node'

export const pow3 = Fn(([x]: [X]): X => {
        return x.mul(x).mul(x)
}).setLayout({
        name: 'pow3',
        type: 'auto',
        inputs: [{ name: 'x', type: 'auto' }],
})
