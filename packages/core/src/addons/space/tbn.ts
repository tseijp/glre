import { Fn, Vec3, Mat3, mat3, normalize, cross } from '../../node'

export const tbn = Fn(([t, b, n]: [Vec3, Vec3, Vec3]): Mat3 => {
        return mat3(t, b, n)
}).setLayout({
        name: 'tbn',
        type: 'mat3',
        inputs: [
                { name: 't', type: 'vec3' },
                { name: 'b', type: 'vec3' },
                { name: 'n', type: 'vec3' },
        ],
})

export const tbnFromNormal = Fn(([n, up]: [Vec3, Vec3]): Mat3 => {
        const t = normalize(cross(up, n)).toVar('t')
        const b = cross(n, t).toVar('b')
        return tbn(t, b, n)
}).setLayout({
        name: 'tbnFromNormal',
        type: 'mat3',
        inputs: [
                { name: 'n', type: 'vec3' },
                { name: 'up', type: 'vec3' },
        ],
})
