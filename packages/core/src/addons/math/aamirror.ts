import { Fn, Float, X, dFdx, dFdy, length, vec2, floor, abs } from '../../node'
import { nyquist } from './nyquist'

export const aamirror = Fn(([x]: [X]): X => {
        const afwidth = length(vec2(dFdx(x), dFdy(x)))
        const v = abs(x.sub(floor(x.add(0.5)))).mul(2.0)
        return nyquist(v, afwidth)
}).setLayout({
        name: 'aamirror',
        type: 'auto',
        inputs: [{ name: 'x', type: 'auto' }],
})
