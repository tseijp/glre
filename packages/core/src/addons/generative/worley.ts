import { Fn, Float, Vec2, Vec3, Loop, int, float, vec2, vec3, If } from '../../node'
import { random2Vec2, random3Vec3 } from './random'
import { distEuclidean } from '../math/dist'

export const worley2Vec2 = Fn(([p]: [Vec2]): Vec2 => {
        const n = p.floor().toVar('n')
        const f = p.fract().toVar('f')
        const distF1 = float(1).toVar('distF1')
        const distF2 = float(1).toVar('distF2')
        const off1 = vec2(0).toVar('off1')
        const pos1 = vec2(0).toVar('pos1')
        const off2 = vec2(0).toVar('off2')
        const pos2 = vec2(0).toVar('pos2')

        Loop(int(3), ({ i }) => {
                Loop(int(3), ({ i: j }) => {
                        const g = vec2(i.toFloat().sub(1), j.toFloat().sub(1)).toVar('g')
                        const o = random2Vec2(n.add(g)).mul(1).toVar('o')
                        const point = g.add(o).toVar('point')
                        const d = distEuclidean(point, f).toVar('d')

                        If(d.lessThan(distF1), () => {
                                distF2.assign(distF1)
                                distF1.assign(d)
                                off2.assign(off1)
                                off1.assign(g)
                                pos2.assign(pos1)
                                pos1.assign(point)
                        }).ElseIf(d.lessThan(distF2), () => {
                                distF2.assign(d)
                                off2.assign(g)
                                pos2.assign(point)
                        })
                })
        })

        return vec2(distF1, distF2)
}).setLayout({
        name: 'worley2Vec2',
        type: 'vec2',
        inputs: [{ name: 'p', type: 'vec2' }],
})

export const worleyVec2 = Fn(([p]: [Vec2]): Float => {
        return float(1).sub(worley2Vec2(p).x)
}).setLayout({
        name: 'worleyVec2',
        type: 'float',
        inputs: [{ name: 'p', type: 'vec2' }],
})

export const worley2Vec3 = Fn(([p]: [Vec3]): Vec2 => {
        const n = p.floor().toVar('n')
        const f = p.fract().toVar('f')
        const distF1 = float(1).toVar('distF1')
        const distF2 = float(1).toVar('distF2')
        const off1 = vec3(0).toVar('off1')
        const pos1 = vec3(0).toVar('pos1')
        const off2 = vec3(0).toVar('off2')
        const pos2 = vec3(0).toVar('pos2')

        Loop(int(3), ({ i }) => {
                Loop(int(3), ({ i: j }) => {
                        Loop(int(3), ({ i: k }) => {
                                const g = vec3(i.toFloat().sub(1), j.toFloat().sub(1), k.toFloat().sub(1)).toVar('g')
                                const o = random3Vec3(n.add(g)).mul(1).toVar('o')
                                const point = g.add(o).toVar('point')
                                const d = distEuclidean(point, f).toVar('d')

                                If(d.lessThan(distF1), () => {
                                        distF2.assign(distF1)
                                        distF1.assign(d)
                                        off2.assign(off1)
                                        off1.assign(g)
                                        pos2.assign(pos1)
                                        pos1.assign(point)
                                }).ElseIf(d.lessThan(distF2), () => {
                                        distF2.assign(d)
                                        off2.assign(g)
                                        pos2.assign(point)
                                })
                        })
                })
        })

        return vec2(distF1, distF2)
}).setLayout({
        name: 'worley2Vec3',
        type: 'vec2',
        inputs: [{ name: 'p', type: 'vec3' }],
})

export const worleyVec3 = Fn(([p]: [Vec3]): Float => {
        return float(1).sub(worley2Vec3(p).x)
}).setLayout({
        name: 'worleyVec3',
        type: 'float',
        inputs: [{ name: 'p', type: 'vec3' }],
})
