import { Fn, Vec3, Float, vec3, vec2 } from '../../node'

export const linkSDF = Fn(([p, le, r1, r2]: [Vec3, Float, Float, Float]): Float => {
        const q = vec3(p.x, p.y.abs().sub(le).max(0), p.z).toVar('q')
        return vec2(vec2(q.x, q.y).length().sub(r1), q.z).length().sub(r2)
}).setLayout({
        name: 'linkSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'le', type: 'float' },
                { name: 'r1', type: 'float' },
                { name: 'r2', type: 'float' },
        ],
})
