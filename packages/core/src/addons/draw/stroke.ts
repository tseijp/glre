import { Fn, Float, smoothstep, clamp } from '../../node'
import { aastep } from '../math/aastep'

export const strokeWithEdge = Fn(([x, size, w, edge]: [Float, Float, Float, Float]): Float => {
        const d = smoothstep(size.sub(edge), size.add(edge), x.add(w.div(2))).sub(
                smoothstep(size.sub(edge), size.add(edge), x.sub(w.div(2)))
        )
        return clamp(d, 0, 1)
}).setLayout({
        name: 'strokeWithEdge',
        type: 'float',
        inputs: [
                { name: 'x', type: 'float' },
                { name: 'size', type: 'float' },
                { name: 'w', type: 'float' },
                { name: 'edge', type: 'float' },
        ],
})

export const stroke = Fn(([x, size, w]: [Float, Float, Float]): Float => {
        const d = aastep(size, x.add(w.div(2))).sub(aastep(size, x.sub(w.div(2))))
        return clamp(d, 0, 1)
}).setLayout({
        name: 'stroke',
        type: 'float',
        inputs: [
                { name: 'x', type: 'float' },
                { name: 'size', type: 'float' },
                { name: 'w', type: 'float' },
        ],
})
