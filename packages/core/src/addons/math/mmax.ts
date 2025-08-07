import { Fn, X, Float } from '../../node'

export const mmax = Fn(([v]: [X]): Float => {
        return v.x.max(v.y).max(v.z).max(v.w)
}).setLayout({
        name: 'mmax',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec4' }],
})
