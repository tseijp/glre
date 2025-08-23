import { Fn, Float, mix, saturate, float } from '../../node'

export const opIntersection = Fn(([d1, d2]: [Float, Float]): Float => {
        return d1.max(d2)
}).setLayout({
        name: 'opIntersection',
        type: 'float',
        inputs: [
                { name: 'd1', type: 'float' },
                { name: 'd2', type: 'float' }
        ]
})

export const opIntersectionSmooth = Fn(([d1, d2, k]: [Float, Float, Float]): Float => {
        const h = float(0.5).sub(d2.sub(d1).div(k).mul(0.5)).saturate().toVar('h')
        return mix(d2, d1, h).add(k.mul(h).mul(h.oneMinus()))
}).setLayout({
        name: 'opIntersectionSmooth',
        type: 'float',
        inputs: [
                { name: 'd1', type: 'float' },
                { name: 'd2', type: 'float' },
                { name: 'k', type: 'float' }
        ]
})