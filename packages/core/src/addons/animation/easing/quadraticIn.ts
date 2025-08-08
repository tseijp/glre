import { Fn, X } from '../../../node'

export const quadraticIn = Fn(([t]: [X]): X => {
        return t.mul(t)
}).setLayout({
        name: 'quadraticIn',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
