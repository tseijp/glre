import { Fn, X, select } from '../../node'

export const absi = Fn(([x]: [X]): X => {
        return select(x.mul(-1), x, x.lessThan(0))
}).setLayout({
        name: 'absi',
        type: 'auto',
        inputs: [{ name: 'x', type: 'auto' }],
})
