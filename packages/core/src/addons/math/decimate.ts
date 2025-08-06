import { X, Fn } from '../../node'

export const decimate = Fn(([v, p]: [X, X]): X => {
        return v.mul(p).floor().div(p)
}).setLayout({
        name: 'decimate',
        type: 'auto',
        inputs: [
                { name: 'v', type: 'auto' },
                { name: 'p', type: 'auto' },
        ],
})