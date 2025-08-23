import { Fn, Vec3, Float, vec3, vec2, mat3, float, If } from '../../node'

export const arrowSDF = Fn(
        ([v, start, end, baseRadius, tipRadius, tipHeight]: [Vec3, Vec3, Vec3, Float, Float, Float]): Float => {
                const t = start.sub(end).toVar('t')
                const l = t.length().toVar('l')
                t.assign(t.div(l))
                l.assign(l.max(tipHeight))
                v.assign(v.sub(end))

                If(t.y.add(1).lessThan(0.0001), () => {
                        v.assign(vec3(v.x, v.y.negate(), v.z))
                }).Else(() => {
                        const k = float(1).div(float(1).add(t.y)).toVar('k')
                        const column1 = vec3(t.z.mul(t.z).mul(k).add(t.y), t.x, t.z.mul(t.x.negate()).mul(k)).toVar(
                                'column1'
                        )
                        const column2 = vec3(t.x.negate(), t.y, t.z.negate()).toVar('column2')
                        const column3 = vec3(t.x.negate().mul(t.z).mul(k), t.z, t.x.mul(t.x).mul(k).add(t.y)).toVar(
                                'column3'
                        )
                        v.assign(
                                mat3(
                                        column1.x,
                                        column1.y,
                                        column1.z,
                                        column2.x,
                                        column2.y,
                                        column2.z,
                                        column3.x,
                                        column3.y,
                                        column3.z
                                ).mul(v)
                        )
                })

                const q = vec2(vec2(v.x, v.z).length(), v.y).toVar('q')
                q.assign(vec2(q.x.abs(), q.y))
                const e = vec2(tipRadius, tipHeight).toVar('e')
                const h = q.dot(e).div(e.dot(e)).clamp(0, 1).toVar('h')
                const d1 = q.sub(e.mul(h)).toVar('d1')
                const d2 = q.sub(vec2(tipRadius, tipHeight)).toVar('d2')
                d2.assign(vec2(d2.x.sub(d2.x.clamp(baseRadius.sub(tipRadius), 0)), d2.y))
                const d3 = q.sub(vec2(baseRadius, tipHeight)).toVar('d3')
                d3.assign(vec2(d3.x, d3.y.sub(d3.y.clamp(0, l.sub(tipHeight)))))
                const d4 = vec2(q.y.sub(l), q.x.sub(baseRadius).max(0)).toVar('d4')
                const s = d1.x.max(d1.y.negate()).max(d4.x).max(d2.y.min(d3.x)).toVar('s')
                return d1.dot(d1).min(d2.dot(d2)).min(d3.dot(d3)).min(d4.dot(d4)).sqrt().mul(s.sign())
        }
).setLayout({
        name: 'arrowSDF',
        type: 'float',
        inputs: [
                { name: 'v', type: 'vec3' },
                { name: 'start', type: 'vec3' },
                { name: 'end', type: 'vec3' },
                { name: 'baseRadius', type: 'float' },
                { name: 'tipRadius', type: 'float' },
                { name: 'tipHeight', type: 'float' },
        ],
})
