import { Fn, Float, Mat4, mat4, vec4 } from '../../node'

export const rotate4dZ = Fn(([r]: [Float]): Mat4 => {
        const c = r.cos()
        const s = r.sin()
        return mat4(vec4(c, s, 0, 0), vec4(s.negate(), c, 0, 0), vec4(0, 0, 1, 0), vec4(0, 0, 0, 1))
}).setLayout({
        name: 'rotate4dZ',
        type: 'mat4',
        inputs: [{ name: 'r', type: 'float' }],
})
