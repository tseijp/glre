import { Fn, Vec3, Float, vec3, mat3 } from '../../node'

export const lookAtForward = Fn(([forward, up]: [Vec3, Vec3]) => {
        const zaxis = forward.normalize().toVar()
        const xaxis = up.cross(zaxis).normalize().toVar()
        const yaxis = zaxis.cross(xaxis).toVar()
        return mat3(xaxis, yaxis, zaxis)
}).setLayout({
        name: 'lookAtForward',
        type: 'mat3',
        inputs: [
                { name: 'forward', type: 'vec3' },
                { name: 'up', type: 'vec3' },
        ],
})

export const lookAt = Fn(([eye, target, up]: [Vec3, Vec3, Vec3]) => {
        const forward = target.sub(eye).normalize().toVar()
        return lookAtForward(forward, up)
}).setLayout({
        name: 'lookAt',
        type: 'mat3',
        inputs: [
                { name: 'eye', type: 'vec3' },
                { name: 'target', type: 'vec3' },
                { name: 'up', type: 'vec3' },
        ],
})

export const lookAtRoll = Fn(([eye, target, roll]: [Vec3, Vec3, Float]) => {
        const up = vec3(roll.sin(), roll.cos(), 0).toVar()
        return lookAt(eye, target, up)
}).setLayout({
        name: 'lookAtRoll',
        type: 'mat3',
        inputs: [
                { name: 'eye', type: 'vec3' },
                { name: 'target', type: 'vec3' },
                { name: 'roll', type: 'float' },
        ],
})

export const lookAtBasic = Fn(([forward]: [Vec3]) => {
        return lookAtForward(forward, vec3(0, 1, 0))
}).setLayout({
        name: 'lookAtBasic',
        type: 'mat3',
        inputs: [{ name: 'forward', type: 'vec3' }],
})
