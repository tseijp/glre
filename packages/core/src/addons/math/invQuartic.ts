import { Fn, X } from '../../node'

export const invQuartic = Fn(([v]: [X]): X => {
        return v.oneMinus().sqrt().oneMinus().sqrt()
}).setLayout({
        name: 'invQuartic',
        type: 'auto',
        inputs: [{ name: 'v', type: 'auto' }],
})