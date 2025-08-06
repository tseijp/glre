import { Fn, X } from '../../node'

export const saturate = Fn(([x]: [X]): X => {
        return x.clamp(0, 1)
}).setLayout({
        name: 'saturate',
        type: 'auto',
        inputs: [
                { name: 'x', type: 'auto' }
        ]
})