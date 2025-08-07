import { Fn, Float, Mat3, Vec3, float, mat3, vec3 } from '../../node'

export const rotate3d = Fn(([a, r]: [Vec3, Float]): Mat3 => {
        const axis = a.normalize().toVar('axis')
        const s = r.sin().toVar('s')
        const c = r.cos().toVar('c')
        const oc = float(1).sub(c).toVar('oc')
        const col1 = vec3(
                oc.mul(axis.x).mul(axis.x).add(c),
                oc.mul(axis.x).mul(axis.y).add(axis.z.mul(s)),
                oc.mul(axis.z).mul(axis.x).sub(axis.y.mul(s))
        )
        const col2 = vec3(
                oc.mul(axis.x).mul(axis.y).sub(axis.z.mul(s)),
                oc.mul(axis.y).mul(axis.y).add(c),
                oc.mul(axis.y).mul(axis.z).add(axis.x.mul(s))
        )
        const col3 = vec3(
                oc.mul(axis.z).mul(axis.x).add(axis.y.mul(s)),
                oc.mul(axis.y).mul(axis.z).sub(axis.x.mul(s)),
                oc.mul(axis.z).mul(axis.z).add(c)
        )
        return mat3(col1, col2, col3)
}).setLayout({
        name: 'rotate3d',
        type: 'mat3',
        inputs: [
                {
                        name: 'a',
                        type: 'vec3'
                },
                {
                        name: 'r',
                        type: 'float'
                }
        ]
})