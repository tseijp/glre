import { describe, it, expect } from '@jest/globals'
import { float, vec2, vec3, vec4, fract, sin, cos, mix, position, iResolution, iTime } from '../../src/node'
import { build } from '../../test-utils'

describe('Shader Patterns', () => {
        describe('Fragment shader basics', () => {
                it('UV coordinate pattern', () => {
                        const wgsl = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar('uv')
                                const color = vec4(uv, float(0), float(1))
                                return color
                        })
                        expect(wgsl).toContain('var uv: vec2f')
                        expect(wgsl).toContain('position.xy / iResolution.xy')
                        expect(wgsl).toContain('return vec4f(uv')
                })

                it('animated color pattern', () => {
                        const wgsl = build(() => {
                                const t = iTime.mul(float(2)).toVar('t')
                                const color = vec3(sin(t), cos(t), fract(t))
                                return vec4(color, float(1))
                        })
                        expect(wgsl).toContain('sin(t)')
                        expect(wgsl).toContain('cos(t)')
                        expect(wgsl).toContain('fract(t)')
                })
        })

        describe('UV transformations', () => {
                it('rotation pattern', () => {
                        const wgsl = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar('uv')
                                const centered = uv.sub(vec2(0.5, 0.5)).toVar('centered')
                                const rotated = vec2(
                                        centered.x.mul(cos(iTime)).sub(centered.y.mul(sin(iTime))),
                                        centered.x.mul(sin(iTime)).add(centered.y.mul(cos(iTime)))
                                ).toVar('rotated')
                                return vec4(rotated.add(vec2(0.5, 0.5)), float(0), float(1))
                        })
                        expect(wgsl).toContain('var centered: vec2f')
                        expect(wgsl).toContain('cos(iTime)')
                        expect(wgsl).toContain('sin(iTime)')
                })

                it('tiling pattern', () => {
                        const wgsl = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar('uv')
                                const tiled = fract(uv.mul(float(8))).toVar('tiled')
                                const pattern = sin(tiled.x.mul(float(6.28))).mul(sin(tiled.y.mul(float(6.28))))
                                return vec4(vec3(pattern), float(1))
                        })
                        expect(wgsl).toContain('fract((uv * f32(8.0)))')
                        expect(wgsl).toContain('f32(6.28)')
                })
        })

        describe('Color operations', () => {
                it('color mixing', () => {
                        const wgsl = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar('uv')
                                const color1 = vec3(1, 0, 0)
                                const color2 = vec3(0, 0, 1)
                                const t = sin(iTime.add(uv.x.mul(float(10))))
                                        .mul(float(0.5))
                                        .add(float(0.5))
                                        .toVar('t')
                                const mixed = mix(color1, color2, t)
                                return vec4(mixed, float(1))
                        })
                        expect(wgsl).toContain('mix(')
                        expect(wgsl).toContain('vec3f(1.0, 0.0, 0.0)')
                        expect(wgsl).toContain('vec3f(0.0, 0.0, 1.0)')
                })

                it('circle drawing', () => {
                        const wgsl = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar('uv')
                                const center = vec2(0.5, 0.5)
                                const radius = float(0.3)
                                const dist = uv.sub(center).length().toVar('dist')
                                const circle = float(1).sub(dist.div(radius)).clamp(float(0), float(1))
                                return vec4(vec3(circle), float(1))
                        })
                        expect(wgsl).toContain('length(')
                        expect(wgsl).toContain('clamp(')
                })
        })

        describe('Practical patterns', () => {
                it('noise-like pattern', () => {
                        const wgsl = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar('uv')
                                const scaled = uv.mul(float(20)).toVar('scaled')
                                const noise = fract(
                                        sin(scaled.x.mul(float(12.9898)).add(scaled.y.mul(float(78.233)))).mul(
                                                float(43758.5)
                                        )
                                )
                                return vec4(vec3(noise), float(1))
                        })
                        expect(wgsl).toContain('f32(12.9898)')
                        expect(wgsl).toContain('f32(78.233)')
                        expect(wgsl).toContain('f32(43758.5)')
                })

                it('wave pattern', () => {
                        const wgsl = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar('uv')
                                const wave1 = sin(uv.x.mul(float(10)).add(iTime.mul(float(2))))
                                const wave2 = sin(uv.y.mul(float(8)).add(iTime.mul(float(1.5))))
                                const combined = wave1.mul(wave2).mul(float(0.5)).add(float(0.5))
                                return vec4(vec3(combined), float(1))
                        })
                        expect(wgsl).toContain('f32(10.0)')
                        expect(wgsl).toContain('f32(8.0)')
                        expect(wgsl).toContain('iTime * f32(2.0)')
                })
        })
})
