import { Fn, Vec3, Float } from '../../node'

export const capsuleSDF = Fn(([p, a, b, r]: [Vec3, Vec3, Vec3, Float]): Float => {
        const pa = p.sub(a).toVar('pa')
        const ba = b.sub(a).toVar('ba')
        const h = pa.dot(ba).div(ba.dot(ba)).clamp(0, 1).toVar('h')
        return pa.sub(ba.mul(h)).length().sub(r)
}).setLayout({
        name: 'capsuleSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'a', type: 'vec3' },
                { name: 'b', type: 'vec3' },
                { name: 'r', type: 'float' },
        ],
})