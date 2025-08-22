import { Fn, Float } from '../../node'

export const opOnion = Fn(([d, h]: [Float, Float]): Float => {
        return d.abs().sub(h)
}).setLayout({
        name: 'opOnion',
        type: 'float',
        inputs: [
                { name: 'd', type: 'float' },
                { name: 'h', type: 'float' },
        ],
})