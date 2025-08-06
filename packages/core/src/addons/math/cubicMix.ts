import { X, Fn } from '../../node'
import { cubic } from './cubic'

export const cubicMix = Fn(([a, b, t]: [X, X, X]): X => {
        return a.add(b.sub(a).mul(cubic(t)))
}).setLayout({
        name: 'cubicMix',
        type: 'auto',
        inputs: [
                { name: 'a', type: 'auto' },
                { name: 'b', type: 'auto' },
                { name: 't', type: 'auto' },
        ],
})