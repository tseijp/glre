import { Fn, Float, Mat3, mat3, vec3 } from '../../node'

export const rotate3dY = Fn(([r]: [Float]): Mat3 => {
        const c = r.cos()
        const s = r.sin()
        return mat3(vec3(c, 0, s.negate()), vec3(0, 1, 0), vec3(s, 0, c))
}).setLayout({
        name: 'rotate3dY',
        type: 'mat3',
        inputs: [{ name: 'r', type: 'float' }],
})
