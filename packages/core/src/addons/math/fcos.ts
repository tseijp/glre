import { Fn, Float, cos, fwidth, smoothstep } from '../../node'
import { TWO_PI } from './const'

export const fcos = Fn(([x]: [Float]): Float => {
        const w = fwidth(x)
        return cos(x).mul(smoothstep(TWO_PI, 0, w))
}).setLayout({
        name: 'fcos',
        type: 'float',
        inputs: [
                {
                        name: 'x',
                        type: 'float',
                },
        ],
})
