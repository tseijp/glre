import { Fn, Mat3, Vec3, vec4, mat4 } from '../../node'

export const translateMat3 = Fn(([m, translation]: [Mat3, Vec3]) => {
        return mat4(vec4(m[0], 0), vec4(m[1], 0), vec4(m[2], 0), vec4(translation, 1))
}).setLayout({
        name: 'translateMat3',
        type: 'mat4',
        inputs: [
                { name: 'm', type: 'mat3' },
                { name: 'translation', type: 'vec3' },
        ],
})
