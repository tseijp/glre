import { Fn, Float, Vec2, Vec3, vec2, vec3, float, floor, fract, mix, smoothstep, dot } from '../../node'
import { randomFloat, randomVec2, randomVec3 } from './random'
import { srandom3Vec3Tiled } from './srandom'
import { cubic } from '../math/cubic'
import { quintic } from '../math/quintic'

export const gnoiseFloat = Fn(([x]: [Float]): Float => {
        const i = floor(x).toVar('i')
        const f = fract(x).toVar('f')
        return mix(randomFloat(i), randomFloat(i.add(1)), smoothstep(0, 1, f))
}).setLayout({
        name: 'gnoiseFloat',
        type: 'float',
        inputs: [{ name: 'x', type: 'float' }],
})

export const gnoiseVec2 = Fn(([st]: [Vec2]): Float => {
        const i = floor(st).toVar('i')
        const f = fract(st).toVar('f')
        const a = randomVec2(i).toVar('a')
        const b = randomVec2(i.add(vec2(1, 0))).toVar('b')
        const c = randomVec2(i.add(vec2(0, 1))).toVar('c')
        const d = randomVec2(i.add(vec2(1, 1))).toVar('d')
        const u = cubic(f).toVar('u')
        return mix(a, b, u.x).add(c.sub(a).mul(u.y).mul(float(1).sub(u.x)).add(d.sub(b).mul(u.x).mul(u.y)))
}).setLayout({
        name: 'gnoiseVec2',
        type: 'float',
        inputs: [{ name: 'st', type: 'vec2' }],
})

export const gnoiseVec3 = Fn(([p]: [Vec3]): Float => {
        const i = floor(p).toVar('i')
        const f = fract(p).toVar('f')
        const u = quintic(f).toVar('u')
        return float(-1).add(
                float(2).mul(
                        mix(
                                mix(
                                        mix(randomVec3(i.add(vec3(0, 0, 0))), randomVec3(i.add(vec3(1, 0, 0))), u.x),
                                        mix(randomVec3(i.add(vec3(0, 1, 0))), randomVec3(i.add(vec3(1, 1, 0))), u.x),
                                        u.y
                                ),
                                mix(
                                        mix(randomVec3(i.add(vec3(0, 0, 1))), randomVec3(i.add(vec3(1, 0, 1))), u.x),
                                        mix(randomVec3(i.add(vec3(0, 1, 1))), randomVec3(i.add(vec3(1, 1, 1))), u.x),
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
        const i = floor(p).toVar('i')
        const f = fract(p).toVar('f')
        const u = quintic(f).toVar('u')
        return mix(
                mix(
                        mix(
                                dot(srandom3Vec3Tiled(i.add(vec3(0, 0, 0)), tileLength), f.sub(vec3(0, 0, 0))),
                                dot(srandom3Vec3Tiled(i.add(vec3(1, 0, 0)), tileLength), f.sub(vec3(1, 0, 0))),
                                u.x
                        ),
                        mix(
                                dot(srandom3Vec3Tiled(i.add(vec3(0, 1, 0)), tileLength), f.sub(vec3(0, 1, 0))),
                                dot(srandom3Vec3Tiled(i.add(vec3(1, 1, 0)), tileLength), f.sub(vec3(1, 1, 0))),
                                u.x
                        ),
                        u.y
                ),
                mix(
                        mix(
                                dot(srandom3Vec3Tiled(i.add(vec3(0, 0, 1)), tileLength), f.sub(vec3(0, 0, 1))),
                                dot(srandom3Vec3Tiled(i.add(vec3(1, 0, 1)), tileLength), f.sub(vec3(1, 0, 1))),
                                u.x
                        ),
                        mix(
                                dot(srandom3Vec3Tiled(i.add(vec3(0, 1, 1)), tileLength), f.sub(vec3(0, 1, 1))),
                                dot(srandom3Vec3Tiled(i.add(vec3(1, 1, 1)), tileLength), f.sub(vec3(1, 1, 1))),
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
