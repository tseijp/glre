import { Fn, Float, Vec2, Vec3, Loop, int, float, mat2 } from '../../node'
import { randomVec2 } from './random'
import { rotate2d } from '../math/rotate2d'

export const wavelet = Fn(([p, phase, k]: [Vec2, Float, Float]): Float => {
        const d = float(0).toVar('d')
        const s = float(1).toVar('s')
        const m = float(0).toVar('m')

        Loop(int(4), ({ i }) => {
                const q = p.mul(s).toVar('q')
                const a = randomVec2(q.floor()).mul(1000).toVar('a')

                q.assign(q.fract().sub(0.5).mul(rotate2d(a)))

                d.addAssign(
                        q.x
                                .mul(10)
                                .add(phase)
                                .sin()
                                .mul(float(0.25).smoothstep(0, q.dot(q)))
                                .div(s)
                )

                p.assign(p.mul(mat2(0.54, -0.84, 0.84, 0.54)).add(i.toFloat()))
                m.addAssign(float(1).div(s))
                s.mulAssign(k)
        })

        return d.div(m)
}).setLayout({
        name: 'wavelet',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 'phase', type: 'float' },
                { name: 'k', type: 'float' },
        ],
})

export const waveletVec3K = Fn(([p, k]: [Vec3, Float]): Float => {
        return wavelet(p.xy, p.z, k)
}).setLayout({
        name: 'waveletVec3K',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'k', type: 'float' },
        ],
})

export const waveletVec3 = Fn(([p]: [Vec3]): Float => {
        return waveletVec3K(p, float(1.24))
}).setLayout({
        name: 'waveletVec3',
        type: 'float',
        inputs: [{ name: 'p', type: 'vec3' }],
})

export const waveletVec2Phase = Fn(([p, phase]: [Vec2, Float]): Float => {
        return wavelet(p, phase, float(1.24))
}).setLayout({
        name: 'waveletVec2Phase',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 'phase', type: 'float' },
        ],
})

export const waveletVec2 = Fn(([p]: [Vec2]): Float => {
        return wavelet(p, float(0), float(1.24))
}).setLayout({
        name: 'waveletVec2',
        type: 'float',
        inputs: [{ name: 'p', type: 'vec2' }],
})
