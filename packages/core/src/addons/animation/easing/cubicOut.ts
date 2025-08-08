import { Fn, X } from '../../../node'

export const cubicOut = Fn(([t]: [X]): X => {
        const f = t.sub(1)
        return f.mul(f).mul(f).add(1)
}).setLayout({
        name: 'cubicOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
