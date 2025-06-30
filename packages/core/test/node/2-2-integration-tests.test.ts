import { describe, it, expect } from '@jest/globals'
import {
        float,
        vec3,
        vec4,
        uniform,
        sin,
        cos,
        mix,
        fract,
        If,
        Loop,
        Fn,
        position,
        iResolution,
        iTime,
        int,
} from '../../src/node'
import { build, inferAndCode } from '../../test-utils'

describe('Integration Tests', () => {
        describe('Complete shader generation', () => {
                it('shader with uniforms', () => {
                        const wgsl = build(() => {
                                const uColorA = uniform(vec3(1, 0, 0), 'colorA')
                                const uColorB = uniform(vec3(0, 0, 1), 'colorB')
                                const t = sin(iTime).mul(float(0.5)).add(float(0.5)).toVar('t')
                                const color = mix(uColorA, uColorB, t)
                                return vec4(color, float(1))
                        })
                        expect(wgsl).toContain('colorA')
                        expect(wgsl).toContain('colorB')
                        expect(wgsl).toContain('sin(iTime)')
                        expect(wgsl).toContain('mix(')
                })

                it('animated shader with control flow', () => {
                        const wgsl = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar('uv')
                                const color = vec3(0, 0, 0).toVar('color')
                                const t = iTime.mul(float(2)).toVar('t')
                                If(uv.x.greaterThan(float(0.5)), () => {
                                        color.assign(vec3(sin(t), cos(t), float(0.5)))
                                }).Else(() => {
                                        color.assign(vec3(float(0.5), sin(t.add(float(1.57))), cos(t.add(float(1.57)))))
                                })
                                return vec4(color, float(1))
                        })
                        expect(wgsl).toContain('if ((uv.x > f32(0.5)))')
                        expect(wgsl).toContain('} else {')
                        expect(wgsl).toContain('sin(')
                        expect(wgsl).toContain('cos(')
                })
        })

        describe('Complex expressions', () => {
                it('nested mathematical operations', () => {
                        const wgsl = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar('uv')
                                const centered = uv.sub(vec3(0.5, 0.5, 0)).toVar('centered')
                                const radius = centered.length().toVar('radius')
                                const angle = fract(radius.mul(float(8)).add(iTime))
                                        .mul(float(6.28))
                                        .toVar('angle')
                                const wave = sin(angle).mul(cos(angle.mul(float(2))))
                                const final = mix(vec3(0, 0, 0), vec3(1, 1, 1), wave.mul(float(0.5)).add(float(0.5)))
                                return vec4(final, float(1))
                        })
                        expect(wgsl).toContain('length(')
                        expect(wgsl).toContain('fract(')
                        expect(wgsl).toContain('f32(6.28)')
                        expect(wgsl).toContain('mix(')
                })

                it('loop with accumulation', () => {
                        const wgsl = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar('uv')
                                const color = vec3(0, 0, 0).toVar('color')
                                Loop(int(5), ({ i }) => {
                                        const offset = i.toFloat().div(float(5)).toVar('offset')
                                        const sample = sin(uv.x.add(offset).mul(float(10)))
                                        color.assign(color.add(vec3(sample.mul(float(0.2)))))
                                })
                                return vec4(color, float(1))
                        })
                        expect(wgsl).toContain('for (var i: i32 = 0; i < i32(5.0); i++)')
                        expect(wgsl).toContain('f32(10.0)')
                        expect(wgsl).toContain('f32(0.2)')
                })
        })

        describe('Modular patterns', () => {
                it('function-based shader', () => {
                        const noise = Fn(([p]) => {
                                return fract(
                                        sin(p.x.mul(float(12.9898)).add(p.y.mul(float(78.233)))).mul(float(43758.5))
                                )
                        })
                        noise.setLayout({
                                name: 'noise',
                                type: 'float',
                                inputs: [{ name: 'p', type: 'vec3' }],
                        })
                        const wgsl = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar('uv')
                                const n1 = noise(vec3(uv.mul(float(5)), iTime))
                                const n2 = noise(vec3(uv.mul(float(10)), iTime.mul(float(2))))
                                const combined = n1.mul(float(0.7)).add(n2.mul(float(0.3)))
                                const color = mix(vec3(0.2, 0.4, 0.8), vec3(0.8, 0.6, 0.2), combined)
                                return vec4(color, float(1))
                        })
                        expect(wgsl).toContain('noise(')
                        expect(wgsl).toContain('f32(0.7)')
                        expect(wgsl).toContain('f32(0.3)')
                })

                it('reactive parameters', () => {
                        const wgsl = build(() => {
                                const uSpeed = uniform(float(1), 'speed')
                                const uScale = uniform(float(1), 'scale')
                                const uColor = uniform(vec3(1, 1, 1), 'color')
                                const uv = position.xy.div(iResolution.xy).toVar('uv')
                                const scaledUV = uv.mul(uScale).toVar('scaledUV')
                                const t = iTime.mul(uSpeed).toVar('t')
                                const pattern = sin(scaledUV.x.add(t)).mul(cos(scaledUV.y.add(t)))
                                const final = uColor.mul(pattern.add(float(1)).mul(float(0.5)))
                                return vec4(final, float(1))
                        })
                        expect(wgsl).toContain('speed')
                        expect(wgsl).toContain('scale')
                        expect(wgsl).toContain('color')
                })
        })

        describe('Type consistency', () => {
                it('complex type inference chain', () => {
                        const x = vec3(1, 2, 3)
                        const y = x.xy.mul(float(2))
                        const z = y.length()
                        const w = sin(z).add(cos(z))
                        expect(inferAndCode(x).type).toBe('vec3')
                        expect(inferAndCode(y).type).toBe('vec2')
                        expect(inferAndCode(z).type).toBe('float')
                        expect(inferAndCode(w).type).toBe('float')
                })
        })
})
