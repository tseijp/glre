import { Fn, Float } from '../../node'

export const opRound = Fn(([d, h]: [Float, Float]): Float => {
        return d.sub(h)
}).setLayout({
        name: 'opRound',
        type: 'float',
        inputs: [
                { name: 'd', type: 'float' },
                { name: 'h', type: 'float' },
        ],
})