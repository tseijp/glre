import { Fn, Mat3, Mat4, mat3 } from '../../node'

export const toMat3 = Fn(([m]: [Mat4]): Mat3 => {
        return mat3(m[0].xyz, m[1].xyz, m[2].xyz)
}).setLayout({
        name: 'toMat3',
        type: 'mat3',
        inputs: [{ name: 'm', type: 'mat4' }],
})
