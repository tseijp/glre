import { Fn } from '../node'

export const linear = Fn(([t]) => {
        return t
}).setLayout({
        name: 'linear',
        type: 'float',
        inputs: [{ type: 'float', name: 't' }],
})
