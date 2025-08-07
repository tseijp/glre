import { Fn, X } from '../../node'

export const pow5 = Fn(([x]: [X]): X => {
        const v2 = x.mul(x).toVar('v2')
        return v2.mul(v2).mul(x)
}).setLayout({
        name: 'pow5',
        type: 'auto',
        inputs: [{ name: 'x', type: 'auto' }],
})
