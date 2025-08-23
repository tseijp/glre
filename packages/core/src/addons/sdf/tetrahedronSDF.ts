import { Fn, Vec3, Float, vec2 } from '../../node'

export const tetrahedronSDF = Fn(([p, h]: [Vec3, Float]): Float => {
        const q = p.abs().toVar('q')
        const y = p.y.toVar('y')
        const d1 = q.z.sub(y.max(0)).toVar('d1')
        const d2 = q.x
                .mul(0.5)
                .add(y.mul(0.5))
                .max(0)
                .sub(h.min(h.add(y)))
                .toVar('d2')
        return vec2(d1, d2).max(0.005).length().add(d1.max(d2).min(0))
}).setLayout({
        name: 'tetrahedronSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'h', type: 'float' },
        ],
})
