import { Fn, Vec3, Vec2, Float, vec2, If } from '../../node'

export const coneSDF = Fn(([p, c]: [Vec3, Vec3]): Float => {
        const q = vec2(vec2(p.x, p.z).length(), p.y).toVar('q')
        const d1 = q.y.negate().sub(c.z).toVar('d1')
        const d2 = q.dot(vec2(c.x, c.y)).max(q.y).toVar('d2')
        return vec2(d1, d2).max(0).length().add(d1.max(d2).min(0))
}).setLayout({
        name: 'coneSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'c', type: 'vec3' }
        ]
})

export const coneSDFVec2Height = Fn(([p, c, h]: [Vec3, Vec2, Float]): Float => {
        const q = h.mul(vec2(c.x, c.y.negate())).div(c.y).toVar('q')
        const w = vec2(vec2(p.x, p.z).length(), p.y).toVar('w')
        const a = w.sub(q.mul(w.dot(q).div(q.dot(q)).clamp(0, 1))).toVar('a')
        const b = w.sub(q.mul(vec2(w.x.div(q.x).clamp(0, 1), 1))).toVar('b')
        const k = q.y.sign().toVar('k')
        const d = a.dot(a).min(b.dot(b)).toVar('d')
        const s = k.mul(w.x.mul(q.y).sub(w.y.mul(q.x))).max(k.mul(w.y.sub(q.y))).toVar('s')
        return d.sqrt().mul(s.sign())
}).setLayout({
        name: 'coneSDFVec2Height',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'c', type: 'vec2' },
                { name: 'h', type: 'float' }
        ]
})

export const coneSDFRadii = Fn(([p, r1, r2, h]: [Vec3, Float, Float, Float]): Float => {
        const q = vec2(vec2(p.x, p.z).length(), p.y).toVar('q')
        const b = r1.sub(r2).div(h).toVar('b')
        const a = b.mul(b).oneMinus().sqrt().toVar('a')
        const k = q.dot(vec2(b.negate(), a)).toVar('k')
        If(k.lessThan(0), () => {
                return q.length().sub(r1)
        })
        If(k.greaterThan(a.mul(h)), () => {
                return q.sub(vec2(0, h)).length().sub(r2)
        })
        return q.dot(vec2(a, b)).sub(r1)
}).setLayout({
        name: 'coneSDFRadii',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'r1', type: 'float' },
                { name: 'r2', type: 'float' },
                { name: 'h', type: 'float' }
        ]
})