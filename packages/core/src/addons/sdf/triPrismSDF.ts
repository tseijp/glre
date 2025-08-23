import { Fn, Vec3, Vec2, Float } from '../../node'

export const triPrismSDF = Fn(([p, h]: [Vec3, Vec2]): Float => {
        const q = p.abs().toVar('q')
        return q.z.sub(h.y).max(q.x.mul(0.866025).add(p.y.mul(0.5)).max(p.y.negate()).sub(h.x.mul(0.5)))
}).setLayout({
        name: 'triPrismSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'h', type: 'vec2' },
        ],
})
