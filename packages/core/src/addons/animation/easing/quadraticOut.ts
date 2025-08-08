import { Fn, X } from '../../../node'

export const quadraticOut = Fn(([t]: [X]): X => {
        return t.mul(t.sub(2)).negate()
}).setLayout({
        name: 'quadraticOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
