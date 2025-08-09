import { Fn, Float } from '../../node'

export const parabola = Fn(([x, k]: [Float, Float]): Float => {
        return x.mul(4).mul(x.oneMinus()).pow(k)
}).setLayout({
        name: 'parabola',
        type: 'float',
        inputs: [
                { name: 'x', type: 'float' },
                { name: 'k', type: 'float' },
        ],
})
