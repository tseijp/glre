import { Fn, X, dot } from '../../node'

export const gaussian = Fn(([d, s]: [X<'vec2' | 'vec3' | 'vec4' | 'ivec2' | 'ivec3' | 'ivec4'>, X]): X => {
        const dotProduct = dot(d, d)
        const variance = s.mul(s).mul(2)
        return dotProduct.negate().div(variance).exp()
}).setLayout({
        name: 'gaussian',
        type: 'float',
        inputs: [
                { name: 'd', type: 'auto' },
                { name: 's', type: 'auto' },
        ],
})
