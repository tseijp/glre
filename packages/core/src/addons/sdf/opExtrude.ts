import { Fn, Vec3, Float, vec2 } from '../../node'

export const opExtrude = Fn(([p, sdf, h]: [Vec3, Float, Float]): Float => {
        const w = vec2(sdf, p.z.abs().sub(h)).toVar('w')
        return w.x.max(w.y).min(0).add(w.max(0).length())
}).setLayout({
        name: 'opExtrude',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'sdf', type: 'float' },
                { name: 'h', type: 'float' },
        ],
})