import { Fn, X } from '../../../node'

export const cubicIn = Fn(([t]: [X]): X => {
        return t.mul(t).mul(t)
}).setLayout({
        name: 'cubicIn',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
