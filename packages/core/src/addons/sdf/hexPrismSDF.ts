import { Fn, Vec3, Vec2, Float, vec2 } from '../../node'

export const hexPrismSDF = Fn(([p, h]: [Vec3, Vec2]): Float => {
        const q = p.abs().toVar('q')
        const d1 = q.z.sub(h.y).toVar('d1')
        const d2 = q.x.mul(0.866025).add(q.y.mul(0.5)).max(q.y).sub(h.x).toVar('d2')
        return vec2(d1, d2).max(0).length().add(d1.max(d2).min(0))
}).setLayout({
        name: 'hexPrismSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'h', type: 'vec2' },
        ],
})
