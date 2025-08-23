import { Fn, Float, Mat3, mat3, vec3 } from '../../node'

export const rotate3dZ = Fn(([r]: [Float]): Mat3 => {
        const c = r.cos()
        const s = r.sin()
        return mat3(vec3(c, s, 0), vec3(s.negate(), c, 0), vec3(0, 0, 1))
}).setLayout({
        name: 'rotate3dZ',
        type: 'mat3',
        inputs: [{ name: 'r', type: 'float' }],
})
