import { Fn, Float, Vec3, Mat3, mat3 } from '../../node'

export const scale3d = Fn(([s]: [Float]): Mat3 => {
        return mat3(s, 0, 0, 0, s, 0, 0, 0, s)
}).setLayout({
        name: 'scale3d',
        type: 'mat3',
        inputs: [{ name: 's', type: 'float' }]
})

export const scale3dVec = Fn(([s]: [Vec3]): Mat3 => {
        return mat3(s.x, 0, 0, 0, s.y, 0, 0, 0, s.z)
}).setLayout({
        name: 'scale3d',
        type: 'mat3',
        inputs: [{ name: 's', type: 'vec3' }]
})
