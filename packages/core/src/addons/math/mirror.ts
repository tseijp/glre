import { Fn, X } from '../../node'

export const mirror = Fn(([x]: [X]): X => {
        const f = x.fract()
        const m = x.mod(2).floor()
        const fm = f.mul(m)
        return f.add(m).sub(fm.mul(2))
}).setLayout({
        name: 'mirror',
        type: 'auto',
        inputs: [{ name: 'x', type: 'auto' }],
})