import { Fn, Float, Mat4, Vec3, float, mat4, vec4 } from '../../node'

export const rotate4d = Fn(([a, r]: [Vec3, Float]): Mat4 => {
        const axis = a.normalize().toVar('axis')
        const s = r.sin().toVar('s')
        const c = r.cos().toVar('c')
        const oc = float(1).sub(c).toVar('oc')
        const col1 = vec4(
                oc.mul(axis.x).mul(axis.x).add(c),
                oc.mul(axis.x).mul(axis.y).add(axis.z.mul(s)),
                oc.mul(axis.z).mul(axis.x).sub(axis.y.mul(s)),
                0
        )
        const col2 = vec4(
                oc.mul(axis.x).mul(axis.y).sub(axis.z.mul(s)),
                oc.mul(axis.y).mul(axis.y).add(c),
                oc.mul(axis.y).mul(axis.z).add(axis.x.mul(s)),
                0
        )
        const col3 = vec4(
                oc.mul(axis.z).mul(axis.x).add(axis.y.mul(s)),
                oc.mul(axis.y).mul(axis.z).sub(axis.x.mul(s)),
                oc.mul(axis.z).mul(axis.z).add(c),
                0
        )
        const col4 = vec4(0, 0, 0, 1)
        return mat4(col1, col2, col3, col4)
}).setLayout({
        name: 'rotate4d',
        type: 'mat4',
        inputs: [
                { name: 'a', type: 'vec3' },
                { name: 'r', type: 'float' },
        ],
})
