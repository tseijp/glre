import { Fn, Vec3, Float, vec3 } from '../../node'

export const boxFrameSDF = Fn(([p, b, e]: [Vec3, Vec3, Float]): Float => {
        const p_abs = p.abs().sub(b).toVar('p_abs')
        const q = p_abs.add(e).abs().sub(e).toVar('q')

        const term1 = vec3(p_abs.x, q.y, q.z)
                .max(vec3(0))
                .length()
                .add(p_abs.x.max(q.y.max(q.z)).min(0))

        const term2 = vec3(q.x, p_abs.y, q.z)
                .max(vec3(0))
                .length()
                .add(q.x.max(p_abs.y.max(q.z)).min(0))

        const term3 = vec3(q.x, q.y, p_abs.z)
                .max(vec3(0))
                .length()
                .add(q.x.max(q.y.max(p_abs.z)).min(0))

        return term1.min(term2).min(term3)
}).setLayout({
        name: 'boxFrameSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'b', type: 'vec3' },
                { name: 'e', type: 'float' },
        ],
})
