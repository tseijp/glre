import { Fn, Float, Mat2, mat2 } from '../../node'

export const rotate2d = Fn(([r]: [Float]): Mat2 => {
        const c = r.cos()
        const s = r.sin()
        return mat2(c, s, s.negate(), c)
}).setLayout({
        name: 'rotate2d',
        type: 'mat2',
        inputs: [{ name: 'r', type: 'float' }],
})
