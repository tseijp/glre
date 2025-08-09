import { Fn, X } from '../../../node'

export const quarticOut = Fn(([t]: [X]): X => {
        const it = t.sub(1)
        return it.mul(it).mul(it).mul(t.oneMinus()).add(1)
}).setLayout({
        name: 'quarticOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
