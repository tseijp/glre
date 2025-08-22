import { Fn, Vec3, Float, vec3, vec2 } from '../../node'

export const octogonPrismSDF = Fn(([p, r, h]: [Vec3, Float, Float]): Float => {
        const k = vec3(-0.9238795325, 0.3826834323, 0.4142135623).toVar('k')
        p.assign(p.abs())
        p.assign(vec3(p.xy.sub(vec2(k.x, k.y).mul(vec2(k.x, k.y).dot(p.xy).min(0).mul(2))), p.z))
        p.assign(vec3(p.xy.sub(vec2(k.x.negate(), k.y).mul(vec2(k.x.negate(), k.y).dot(p.xy).min(0).mul(2))), p.z))
        p.assign(vec3(p.xy.sub(vec2(p.x.clamp(k.z.negate().mul(r), k.z.mul(r)), r)), p.z))
        const d = vec2(p.xy.length().mul(p.y.sign()), p.z.sub(h)).toVar('d')
        return d.x.max(d.y).min(0).add(d.max(0).length())
}).setLayout({
        name: 'octogonPrismSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'r', type: 'float' },
                { name: 'h', type: 'float' },
        ],
})
