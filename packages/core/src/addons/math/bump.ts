import { Fn, X } from '../../node'

export const bump = Fn(([x, k]: [X, X]): X => {
        return x.mul(x).sub(1).negate().sub(k).saturate()
}).setLayout({
        name: 'bump',
        type: 'auto',
        inputs: [
                { name: 'x', type: 'auto' },
                { name: 'k', type: 'auto' },
        ],
})

export const bumpSimple = Fn(([x]: [X]): X => {
        return x.mul(x).sub(1).negate().max(0)
}).setLayout({
        name: 'bumpSimple',
        type: 'auto',
        inputs: [{ name: 'x', type: 'auto' }],
})
