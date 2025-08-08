import { Fn, X } from '../../../node'

export const quarticIn = Fn(([t]: [X]): X => {
        return t.pow(4)
}).setLayout({
        name: 'quarticIn',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})