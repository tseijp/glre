import { Fn, Float, float } from '../../../node'
import { backIn } from './backIn'

export const backOut = Fn(([t]: [Float]): Float => {
        return float(1).sub(backIn(float(1).sub(t)))
}).setLayout({
        name: 'backOut',
        type: 'float',
        inputs: [{ name: 't', type: 'float' }],
})
