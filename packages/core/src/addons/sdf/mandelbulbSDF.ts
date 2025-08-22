import { Fn, Vec3, Vec2, vec2, vec3, float, Loop, If, Break } from '../../node'
import { cart2polar3D } from '../space/cart2polar'

export const mandelbulbSDF = Fn(([st]: [Vec3]): Vec2 => {
        const zeta = st.toVar('zeta')
        const m = st.dot(st).toVar('m')
        const dz = float(1).toVar('dz')
        const n = float(8).toVar('n')
        const maxiterations = 20
        const iterations = float(0).toVar('iterations')
        const r = float(0).toVar('r')
        const dr = float(1).toVar('dr')

        Loop(maxiterations, () => {
                dz.assign(n.mul(m.pow(3.5)).mul(dz).add(1))
                const sphericalZ = cart2polar3D(zeta).toVar('sphericalZ')
                const newx = sphericalZ.x
                        .pow(n)
                        .mul(sphericalZ.y.mul(n).sin())
                        .mul(sphericalZ.z.mul(n).cos())
                        .toVar('newx')
                const newy = sphericalZ.x
                        .pow(n)
                        .mul(sphericalZ.y.mul(n).sin())
                        .mul(sphericalZ.z.mul(n).sin())
                        .toVar('newy')
                const newz = sphericalZ.x.pow(n).mul(sphericalZ.y.mul(n).cos()).toVar('newz')
                zeta.assign(vec3(newx.add(st.x), newy.add(st.y), newz.add(st.z)))
                m.assign(zeta.dot(zeta))
                If(m.greaterThan(2), () => {
                        Break()
                })
                iterations.assign(iterations.add(1))
        })

        return vec2(float(0.25).mul(m.log()).mul(m.sqrt()).div(dz), iterations)
}).setLayout({
        name: 'mandelbulbSDF',
        type: 'vec2',
        inputs: [{ name: 'st', type: 'vec3' }],
})
