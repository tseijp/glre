import { Fn, X, cos } from '../../../node'
import { PI } from '../../math/const'

export const sineInOut = Fn(([t]: [X]): X => {
        return cos(PI.mul(t)).sub(1).mul(-0.5)
}).setLayout({
        name: 'sineInOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
