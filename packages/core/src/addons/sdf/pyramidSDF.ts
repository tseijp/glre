import { Fn, Vec3, Float, vec3, vec2, select, float } from '../../node'

export const pyramidSDF = Fn(([p, h]: [Vec3, Float]): Float => {
        const m2 = h.mul(h).add(0.25).toVar('m2')
        const pxz = vec2(p.x, p.z).abs().toVar('pxz')
        const pxzSwapped = select(vec2(pxz.y, pxz.x), pxz, pxz.y.greaterThan(pxz.x)).toVar('pxzSwapped')
        const pxzFinal = pxzSwapped.sub(0.5).toVar('pxzFinal')
        p.assign(vec3(pxzFinal.x, p.y, pxzFinal.y))
        const q = vec3(p.z, h.mul(p.y).sub(p.x.mul(0.5)), h.mul(p.x).add(p.y.mul(0.5))).toVar('q')
        const s = q.x.negate().max(0).toVar('s')
        const t = q.y.sub(p.z.mul(0.5)).div(m2.add(0.25)).clamp(0, 1).toVar('t')
        const a = m2.mul(q.x.add(s)).mul(q.x.add(s)).add(q.y.mul(q.y)).toVar('a')
        const b = m2
                .mul(q.x.add(t.mul(0.5)))
                .mul(q.x.add(t.mul(0.5)))
                .add(q.y.sub(m2.mul(t)).mul(q.y.sub(m2.mul(t))))
                .toVar('b')
        const d2 = select(float(0), a.min(b), q.y.min(q.x.negate().mul(m2).sub(q.y.mul(0.5))).greaterThan(0))
                .toFloat()
                .toVar('d2')
        return d2.add(q.z.mul(q.z)).div(m2).sqrt().mul(q.z.max(p.y.negate()).sign())
}).setLayout({
        name: 'pyramidSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'h', type: 'float' },
        ],
})
