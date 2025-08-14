import { Fn, Vec2, Vec3, Float, cos, sin, vec2, vec3 } from '../../node'

export const polar2cart = Fn(([polar]: [Vec2]): Vec2 => {
        return vec2(cos(polar.x), sin(polar.x)).mul(polar.y)
}).setLayout({
        name: 'polar2cart',
        type: 'vec2',
        inputs: [{ name: 'polar', type: 'vec2' }],
})

export const polar2cart3D = Fn(([r, phi, theta]: [Float, Float, Float]): Vec3 => {
        const x = r.mul(cos(theta)).mul(sin(phi)).toVar('x')
        const y = r.mul(sin(theta)).mul(sin(phi)).toVar('y')
        const z = r.mul(cos(phi)).toVar('z')
        return vec3(x, y, z)
}).setLayout({
        name: 'polar2cart3D',
        type: 'vec3',
        inputs: [
                { name: 'r', type: 'float' },
                { name: 'phi', type: 'float' },
                { name: 'theta', type: 'float' },
        ],
})
