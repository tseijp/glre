import { Fn, Float, float } from '../../../node'
import { bounceOut } from './bounceOut'

export const bounceInOut = Fn(([t]: [Float]): Float => {
        return float(1)
                .sub(bounceOut(float(1).sub(t.mul(2))))
                .mul(0.5)
                .select(bounceOut(t.mul(2).sub(1)).mul(0.5).add(0.5), t.lessThan(0.5))
}).setLayout({
        name: 'bounceInOut',
        type: 'float',
        inputs: [{ name: 't', type: 'float' }],
})
