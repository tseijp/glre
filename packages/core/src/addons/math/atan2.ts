import { PI } from './const'
import { Fn, Float, X, atan, mod } from '../../node'
import { PI, TAU } from './const'

export const atan2 = Fn(([y, x]: [X, X]): X => {
        return mod(atan(y.div(x)).add(PI), TAU)
}).setLayout({
        name: 'atan2',
        type: 'auto',
        inputs: [
                { name: 'y', type: 'auto' },
                { name: 'x', type: 'auto' },
        ],
})
