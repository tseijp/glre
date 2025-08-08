import { Fn, Float, smoothstep } from '../../node'
import { aastep } from '../math/aastep'

// Fill function with edge parameter
export const fillWithEdge = Fn(([x, size, edge]: [Float, Float, Float]): Float => {
        return smoothstep(size.sub(edge), size.add(edge), x).oneMinus()
}).setLayout({
        name: 'fillWithEdge',
        type: 'float',
        inputs: [
                { name: 'x', type: 'float' },
                { name: 'size', type: 'float' },
                { name: 'edge', type: 'float' },
        ],
})

// Fill function using anti-aliased step
export const fill = Fn(([x, size]: [Float, Float]): Float => {
        return aastep(size, x).oneMinus()
}).setLayout({
        name: 'fill',
        type: 'float',
        inputs: [
                { name: 'x', type: 'float' },
                { name: 'size', type: 'float' },
        ],
})
