import { Fn, X } from '../../../node'

export const circularIn = Fn(([t]: [X]): X => {
        return t.mul(t).oneMinus().sqrt().oneMinus()
}).setLayout({
        name: 'circularIn',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
