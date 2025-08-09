import { Fn, Float, Vec2, Vec3, vec2, vec3, int, floor, fract, smoothstep, pow, length, float, Loop } from '../../node'
import { random3Vec2, random3Vec3 } from './random'

export const voronoise = Fn(([p, u, v]: [Vec2, Float, Float]): Float => {
        const k = float(1)
                .add(float(63).mul(pow(float(1).sub(v), float(6))))
                .toVar('k')
        const i = floor(p).toVar('i')
        const f = fract(p).toVar('f')
        const a = vec2(0, 0).toVar('a')

        // 5x5 grid sampling from -2 to +2
        Loop(int(5), ({ i: yLoop }) => {
                const yOffset = yLoop.sub(int(2)).toFloat().toVar('yOffset')
                Loop(int(5), ({ i: xLoop }) => {
                        const xOffset = xLoop.sub(int(2)).toFloat().toVar('xOffset')
                        const g = vec2(xOffset, yOffset).toVar('g')
                        const o = random3Vec2(i.add(g)).mul(vec3(u, u, 1)).toVar('o')
                        const d = g.sub(f).add(o.xy).toVar('d')
                        const w = pow(float(1).sub(smoothstep(0, 1.414, length(d))), k).toVar('w')
                        a.addAssign(vec2(o.z.mul(w), w))
                })
        })

        return a.x.div(a.y)
}).setLayout({
        name: 'voronoise',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 'u', type: 'float' },
                { name: 'v', type: 'float' },
        ],
})

export const voronoiseVec3 = Fn(([p, u, v]: [Vec3, Float, Float]): Float => {
        const k = float(1)
                .add(float(63).mul(pow(float(1).sub(v), float(6))))
                .toVar('k')
        const i = floor(p).toVar('i')
        const f = fract(p).toVar('f')
        const a = vec2(0, 0).toVar('a')

        // 5x5x5 grid sampling from -2 to +2
        Loop(int(5), ({ i: zLoop }) => {
                const zOffset = zLoop.sub(int(2)).toFloat().toVar('zOffset')
                Loop(int(5), ({ i: yLoop }) => {
                        const yOffset = yLoop.sub(int(2)).toFloat().toVar('yOffset')
                        Loop(int(5), ({ i: xLoop }) => {
                                const xOffset = xLoop.sub(int(2)).toFloat().toVar('xOffset')
                                const g = vec3(xOffset, yOffset, zOffset).toVar('g')
                                const o = random3Vec3(i.add(g)).mul(vec3(u, u, 1)).toVar('o')
                                const d = g.sub(f).add(o).add(0.5).toVar('d')
                                const w = pow(float(1).sub(smoothstep(0, 1.414, length(d))), k).toVar('w')
                                a.addAssign(vec2(o.z.mul(w), w))
                        })
                })
        })

        return a.x.div(a.y)
}).setLayout({
        name: 'voronoiseVec3',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'u', type: 'float' },
                { name: 'v', type: 'float' },
        ],
})
