import { Fn, X, sin } from '../../../node'
import { HALF_PI } from '../../math/const'

export const sineOut = Fn(([t]: [X]): X => {
        return sin(t.mul(HALF_PI as any))
}).setLayout({
        name: 'sineOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
