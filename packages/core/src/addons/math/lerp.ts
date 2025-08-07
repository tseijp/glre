import { Fn, X } from '../../node'

export const lerp = Fn(([a, b, pct]: [X, X, X]): X => {
        return a.mix(b, pct)
}).setLayout({
        name: 'lerp',
        type: 'auto',
        inputs: [
                { name: 'a', type: 'auto' },
                { name: 'b', type: 'auto' },
                { name: 'pct', type: 'auto' }
        ]
})