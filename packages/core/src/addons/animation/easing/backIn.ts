import { Fn, Float, pow, sin } from '../../../node'
import { PI } from '../../math/const'

export const backIn = Fn(([t]: [Float]): Float => {
        return pow(t, 3).sub(t.mul(sin(t.mul(PI))))
}).setLayout({
        name: 'backIn',
        type: 'float',
        inputs: [{ name: 't', type: 'float' }],
})
