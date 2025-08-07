import { Fn, Float, Vec3, Vec4, Mat4, mat4 } from '../../node'

export const scale4d = Fn(([s]: [Float]): Mat4 => {
        return mat4(s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1)
}).setLayout({
        name: 'scale4d',
        type: 'mat4',
        inputs: [{ name: 's', type: 'float' }]
})

export const scale4dXYZ = Fn(([x, y, z]: [Float, Float, Float]): Mat4 => {
        return mat4(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1)
}).setLayout({
        name: 'scale4d',
        type: 'mat4',
        inputs: [
                { name: 'x', type: 'float' },
                { name: 'y', type: 'float' },
                { name: 'z', type: 'float' }
        ]
})

export const scale4dXYZW = Fn(([x, y, z, w]: [Float, Float, Float, Float]): Mat4 => {
        return mat4(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, w)
}).setLayout({
        name: 'scale4d',
        type: 'mat4',
        inputs: [
                { name: 'x', type: 'float' },
                { name: 'y', type: 'float' },
                { name: 'z', type: 'float' },
                { name: 'w', type: 'float' }
        ]
})

export const scale4dVec3 = Fn(([s]: [Vec3]): Mat4 => {
        return mat4(s.x, 0, 0, 0, 0, s.y, 0, 0, 0, 0, s.z, 0, 0, 0, 0, 1)
}).setLayout({
        name: 'scale4d',
        type: 'mat4',
        inputs: [{ name: 's', type: 'vec3' }]
})

export const scale4dVec4 = Fn(([s]: [Vec4]): Mat4 => {
        return mat4(s.x, 0, 0, 0, 0, s.y, 0, 0, 0, 0, s.z, 0, 0, 0, 0, s.w)
}).setLayout({
        name: 'scale4d',
        type: 'mat4',
        inputs: [{ name: 's', type: 'vec4' }]
})