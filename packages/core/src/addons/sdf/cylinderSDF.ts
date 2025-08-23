import { Fn, Vec3, Vec2, Float, vec2, select, float } from '../../node'

export const cylinderSDF = Fn(([p, h]: [Vec3, Vec2]): Float => {
        const d = vec2(vec2(p.x, p.z).length(), p.y).abs().sub(h).toVar('d')
        return d.x.max(d.y).min(0).add(d.max(0).length())
}).setLayout({
        name: 'cylinderSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'h', type: 'vec2' },
        ],
})

export const cylinderSDFHeight = Fn(([p, h]: [Vec3, Float]): Float => {
        return cylinderSDF(p, vec2(h))
}).setLayout({
        name: 'cylinderSDFHeight',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'h', type: 'float' },
        ],
})

export const cylinderSDFHeightRadius = Fn(([p, h, r]: [Vec3, Float, Float]): Float => {
        const d = vec2(vec2(p.x, p.z).length(), p.y).abs().sub(vec2(h, r)).toVar('d')
        return d.x.max(d.y).min(0).add(d.max(0).length())
}).setLayout({
        name: 'cylinderSDFHeightRadius',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'h', type: 'float' },
                { name: 'r', type: 'float' },
        ],
})

export const cylinderSDFCaps = Fn(([p, a, b, r]: [Vec3, Vec3, Vec3, Float]): Float => {
        const pa = p.sub(a).toVar('pa')
        const ba = b.sub(a).toVar('ba')
        const baba = ba.dot(ba).toVar('baba')
        const paba = pa.dot(ba).toVar('paba')
        const x = pa.mul(baba).sub(ba.mul(paba)).length().sub(r.mul(baba)).toVar('x')
        const y = paba.sub(baba.mul(0.5)).abs().sub(baba.mul(0.5)).toVar('y')
        const x2 = x.mul(x).toVar('x2')
        const y2 = y.mul(y).mul(baba).toVar('y2')
        const d = select(
                select(float(0), x2, x.greaterThan(0)).add(select(float(0), y2, y.greaterThan(0))),
                x2.min(y2).negate(),
                x.max(y).lessThan(0)
        )
                .toFloat()
                .toVar('d')
        return d.sign().mul(d.abs().sqrt()).div(baba)
}).setLayout({
        name: 'cylinderSDFCaps',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'a', type: 'vec3' },
                { name: 'b', type: 'vec3' },
                { name: 'r', type: 'float' },
        ],
})
