import { Fn, Vec3, Float } from '../../node'

export const ellipsoidSDF = Fn(([p, r]: [Vec3, Vec3]): Float => {
        const k0 = p.div(r).length().toVar('k0')
        const k1 = p.div(r.mul(r)).length().toVar('k1')
        return k0.mul(k0.sub(1)).div(k1)
}).setLayout({
        name: 'ellipsoidSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'r', type: 'vec3' },
        ],
})