import { Fn, X, float, dot } from '../../node'

export const gaussian = Fn(([d, s]: [X, X]): X => {
        const dotProduct = dot(d, d)
        const variance = float(2).mul(s).mul(s)
        return dotProduct.negate().div(variance).exp()
}).setLayout({
        name: 'gaussian',
        type: 'float',
        inputs: [
                { name: 'd', type: 'auto' },
                { name: 's', type: 'auto' }
        ]
})