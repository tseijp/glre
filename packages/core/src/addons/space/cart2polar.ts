import { Fn, Vec2, Vec3, atan2, length, acos, vec2, vec3 } from '../../node'

export const cart2polar = Fn(([st]: [Vec2]): Vec2 => {
        return vec2(atan2(st.y, st.x), length(st))
}).setLayout({
        name: 'cart2polar',
        type: 'vec2',
        inputs: [{ name: 'st', type: 'vec2' }],
})

export const cart2polar3D = Fn(([st]: [Vec3]): Vec3 => {
        const r = length(st).toVar('r')
        const phi = acos(st.z.div(r)).toVar('phi')
        const theta = atan2(st.y, st.x).toVar('theta')
        return vec3(r, phi, theta)
}).setLayout({
        name: 'cart2polar3D',
        type: 'vec3',
        inputs: [{ name: 'st', type: 'vec3' }],
})
