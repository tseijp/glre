import { Fn, Mat3, Mat4, mat4, vec4 } from '../../node'

export const toMat4 = Fn(([m]: [Mat3]): Mat4 => {
        return mat4(vec4(m[0], 0), vec4(m[1], 0), vec4(m[2], 0), vec4(0, 0, 0, 1))
}).setLayout({
        name: 'toMat4',
        type: 'mat4',
        inputs: [{ name: 'm', type: 'mat3' }],
})
