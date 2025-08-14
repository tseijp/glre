import { Fn, Vec3, dot, length, cross, normalize, max, min, vec3, float, If, Return } from '../../../node'
import { barycentricFromVec3 } from './barycentric'
import { TriangleType } from './triangle'

export const closestPointWithNormal = Fn(([tri, triNormal, pos]: [TriangleType, Vec3, Vec3]): Vec3 => {
        const a = tri.a
        const b = tri.b
        const c = tri.c
        const ab = b.sub(a)
        const ac = c.sub(a)
        const p = pos.sub(dot(triNormal, pos.sub(a)).mul(triNormal))
        const ap = p.sub(a)
        const bcoords = barycentricFromVec3(ab, ac, ap)

        If(bcoords.x.lessThan(0), () => {
                const bc = c.sub(b).toVar('bc')
                const n = length(bc).toVar('n')
                const t = max(float(0), min(dot(bc, p.sub(b)).div(n), n)).toVar('t')
                Return(b.add(t.div(n).mul(bc)))
        })

        If(bcoords.y.lessThan(0), () => {
                const ca = a.sub(c).toVar('ca')
                const n = length(ca).toVar('n')
                const t = max(float(0), min(dot(ca, p.sub(c)).div(n), n)).toVar('t')
                Return(c.add(t.div(n).mul(ca)))
        })

        If(bcoords.z.lessThan(0), () => {
                const n = length(ab).toVar('n')
                const t = max(float(0), min(dot(ab, p.sub(a)).div(n), n)).toVar('t')
                Return(a.add(t.div(n).mul(ab)))
        })

        return a.mul(bcoords.x).add(b.mul(bcoords.y)).add(c.mul(bcoords.z))
}).setLayout({
        name: 'closestPointWithNormal',
        type: 'vec3',
        inputs: [
                { name: 'tri', type: 'auto' },
                { name: 'triNormal', type: 'vec3' },
                { name: 'pos', type: 'vec3' },
        ],
})

export const closestPoint = Fn(([tri, pos]: [TriangleType, Vec3]): Vec3 => {
        const a = tri.a
        const b = tri.b
        const c = tri.c
        const ab = b.sub(a) // .toVar('ab') @TODO FIX
        const ac = c.sub(a)
        const normal = normalize(cross(ac, ab))
        const p = pos.sub(dot(normal, pos.sub(a)).mul(normal))
        const ap = p.sub(a)
        const bcoords = barycentricFromVec3(ab, ac, ap)

        If(bcoords.x.lessThan(0), () => {
                const bc = c.sub(b).toVar('bc')
                const n = length(bc).toVar('n')
                const t = max(float(0), min(dot(bc, p.sub(b)).div(n), n)).toVar('t')
                Return(b.add(t.div(n).mul(bc)))
        })

        If(bcoords.y.lessThan(0), () => {
                const ca = a.sub(c).toVar('ca')
                const n = length(ca).toVar('n')
                const t = max(float(0), min(dot(ca, p.sub(c)).div(n), n)).toVar('t')
                Return(c.add(t.div(n).mul(ca)))
        })

        If(bcoords.z.lessThan(0), () => {
                const n = length(ab).toVar('n')
                const t = max(float(0), min(dot(ab, p.sub(a)).div(n), n)).toVar('t')
                Return(a.add(t.div(n).mul(ab)))
        })

        return a.mul(bcoords.x).add(b.mul(bcoords.y)).add(c.mul(bcoords.z))
}).setLayout({
        name: 'closestPoint',
        type: 'vec3',
        inputs: [
                { name: 'tri', type: 'auto' },
                { name: 'pos', type: 'vec3' },
        ],
})
