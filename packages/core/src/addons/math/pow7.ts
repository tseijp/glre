import { Fn, X } from '../../node'

export const pow7 = Fn(([x]: [X]): X => {
        const v2 = x.mul(x).toVar('v2')
        const v4 = v2.mul(v2).toVar('v4')
        const v6 = v4.mul(v2).toVar('v6')
        return v6.mul(x)
}).setLayout({
        name: 'pow7',
        type: 'auto',
        inputs: [{ name: 'x', type: 'auto' }],
})
