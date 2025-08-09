import { Fn, Float, Vec2, Vec3, vec2, vec3, float } from '../../node'
import { random, randomVec2, randomVec3 } from './random'
import { srandom3Vec3Tiled } from './srandom'
import { cubicVec2 } from '../math/cubic'
import { quintic } from '../math/quintic'

export const gnoise = Fn(([x]: [Float]): Float => {
        const i = x.floor().toVar('i')
        const f = x.fract().toVar('f')
        return random(i).mix(random(i.add(1)), float(0).smoothstep(float(1), f))
}).setLayout({
        name: 'gnoise',
        type: 'float',
        inputs: [{ name: 'x', type: 'float' }],
})

export const gnoiseVec2 = Fn(([st]: [Vec2]): Float => {
        const i = st.floor().toVar('i')
        const f = st.fract().toVar('f')
        const a = randomVec2(i).toVar('a')
        const b = randomVec2(i.add(vec2(1, 0))).toVar('b')
        const c = randomVec2(i.add(vec2(0, 1))).toVar('c')
        const d = randomVec2(i.add(vec2(1, 1))).toVar('d')
        const u = cubicVec2(f).toVar('u')
        return a.mix(b, u.x).add(c.sub(a).mul(u.y).mul(float(1).sub(u.x)).add(d.sub(b).mul(u.x).mul(u.y)))
}).setLayout({
        name: 'gnoiseVec2',
        type: 'float',
        inputs: [{ name: 'st', type: 'vec2' }],
})

export const gnoiseVec3 = Fn(([p]: [Vec3]): Float => {
        const i = p.floor().toVar('i')
        const f = p.fract().toVar('f')
        const u = quintic(f).toVar('u')
        return float(-1).add(
                float(2).mul(
                        randomVec3(i.add(vec3(0, 0, 0)))
                                .mix(randomVec3(i.add(vec3(1, 0, 0))), u.x)
                                .mix(randomVec3(i.add(vec3(0, 1, 0))).mix(randomVec3(i.add(vec3(1, 1, 0))), u.x), u.y)
                                .mix(
                                        randomVec3(i.add(vec3(0, 0, 1)))
                                                .mix(randomVec3(i.add(vec3(1, 0, 1))), u.x)
                                                .mix(
                                                        randomVec3(i.add(vec3(0, 1, 1))).mix(
                                                                randomVec3(i.add(vec3(1, 1, 1))),
                                                                u.x
                                                        ),
                                                        u.y
                                                ),
                                        u.z
                                )
                )
        )
}).setLayout({
        name: 'gnoiseVec3',
        type: 'float',
        inputs: [{ name: 'p', type: 'vec3' }],
})

export const gnoiseVec3Tiled = Fn(([p, tileLength]: [Vec3, Float]): Float => {
        const i = p.floor().toVar('i')
        const f = p.fract().toVar('f')
        const u = quintic(f).toVar('u')
        return srandom3Vec3Tiled(i.add(vec3(0, 0, 0)), tileLength)
                .dot(f.sub(vec3(0, 0, 0)))
                .mix(srandom3Vec3Tiled(i.add(vec3(1, 0, 0)), tileLength).dot(f.sub(vec3(1, 0, 0))), u.x)
                .mix(
                        srandom3Vec3Tiled(i.add(vec3(0, 1, 0)), tileLength)
                                .dot(f.sub(vec3(0, 1, 0)))
                                .mix(
                                        srandom3Vec3Tiled(i.add(vec3(1, 1, 0)), tileLength).dot(f.sub(vec3(1, 1, 0))),
                                        u.x
                                ),
                        u.y
                )
                .mix(
                        srandom3Vec3Tiled(i.add(vec3(0, 0, 1)), tileLength)
                                .dot(f.sub(vec3(0, 0, 1)))
                                .mix(srandom3Vec3Tiled(i.add(vec3(1, 0, 1)), tileLength).dot(f.sub(vec3(1, 0, 1))), u.x)
                                .mix(
                                        srandom3Vec3Tiled(i.add(vec3(0, 1, 1)), tileLength)
                                                .dot(f.sub(vec3(0, 1, 1)))
                                                .mix(
                                                        srandom3Vec3Tiled(i.add(vec3(1, 1, 1)), tileLength).dot(
                                                                f.sub(vec3(1, 1, 1))
                                                        ),
                                                        u.x
                                                ),
                                        u.y
                                ),
                        u.z
                )
}).setLayout({
        name: 'gnoiseVec3Tiled',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'tileLength', type: 'float' },
        ],
})

export const gnoise3 = Fn(([x]: [Vec3]): Vec3 => {
        return vec3(
                gnoiseVec3(x.add(vec3(123.456, 0.567, 0.37))),
                gnoiseVec3(x.add(vec3(0.11, 47.43, 19.17))),
                gnoiseVec3(x)
        )
}).setLayout({
        name: 'gnoise3',
        type: 'vec3',
        inputs: [{ name: 'x', type: 'vec3' }],
})
