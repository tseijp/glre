import { Fn, Mat3, Mat4, X, mat3, mat4, vec3, vec4 } from '../../node'

export const transpose = Fn(([m]: [X]): X => {
        // mat3の場合
        const col0 = (m as any)[0]
        const col1 = (m as any)[1]
        const col2 = (m as any)[2]
        const col3 = (m as any)[3]

        if (col3 === undefined) {
                // mat3
                return mat3(
                        vec3(col0[0], col1[0], col2[0]),
                        vec3(col0[1], col1[1], col2[1]),
                        vec3(col0[2], col1[2], col2[2])
                )
        } else {
                // mat4
                return mat4(
                        vec4(col0[0], col1[0], col2[0], col3[0]),
                        vec4(col0[1], col1[1], col2[1], col3[1]),
                        vec4(col0[2], col1[2], col2[2], col3[2]),
                        vec4(col0[3], col1[3], col2[3], col3[3])
                )
        }
}).setLayout({
        name: 'transpose',
        type: 'auto',
        inputs: [{ name: 'm', type: 'auto' }],
})
