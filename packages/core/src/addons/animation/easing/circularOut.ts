import { Fn, X } from '../../../node'

export const circularOut = Fn(([t]: [X]): X => {
        return t.mul(2).sub(t).mul(t).sqrt()
}).setLayout({
        name: 'circularOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})