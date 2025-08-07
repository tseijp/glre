import { Fn, X, dFdx, dFdy, fract, float, select } from '../../node'
import { mapRange } from './map'

export const aafloor = Fn(([x]: [X]): X => {
        const afwidth = dFdx(x).pow(2).add(dFdy(x).pow(2)).sqrt().mul(2).toVar()
        const fx = fract(x).toVar()
        const idx = afwidth.oneMinus().toVar()
        return select(x.sub(fx), mapRange(fx, idx, float(1), x.sub(fx), x), fx.lessThan(idx))
}).setLayout({
        name: 'aafloor',
        type: 'auto',
        inputs: [{ name: 'x', type: 'auto' }],
})
