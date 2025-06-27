import { describe, it, expect } from '@jest/globals'
import { float, vec2, vec3, vec4, fract, sin, cos, mix, position, iResolution, iTime } from '../../src/node'
import { build } from './utils'

describe('Shader Patterns', () => {
        describe('Fragment shader basics', () => {
                it('basic fragment pattern', () => {
                        const def = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const color = vec4(uv, float(0), float(1))
                                return color
                        })
                        expect(def).toContain('var i')
                        expect(def).toContain('position.xy')
                        expect(def).toContain('iResolution.xy')
                        expect(def).toContain('return vec4f(i')
                })

                it('animated fragment pattern', () => {
                        const def = build(() => {
                                const t = iTime.mul(float(2))
                                const color = vec3(sin(t), cos(t), fract(t))
                                return vec4(color, float(1))
                        })
                        expect(def).toContain('sin(')
                        expect(def).toContain('cos(')
                        expect(def).toContain('fract(')
                        expect(def).toContain('iTime * f32(2.0)')
                })
        })

        describe('UV operations and patterns', () => {
                it('UV transformation', () => {
                        const def = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const centered = uv.sub(vec2(0.5, 0.5)).toVar()
                                const rotated = vec2(
                                        centered.x.mul(cos(iTime)).sub(centered.y.mul(sin(iTime))),
                                        centered.x.mul(sin(iTime)).add(centered.y.mul(cos(iTime)))
                                ).toVar()
                                return vec4(rotated.add(vec2(0.5, 0.5)), float(0), float(1))
                        })
                        expect(def).toContain('var i')
                        expect(def).toContain(' - vec2f(0.5, 0.5)')
                        expect(def).toContain('cos(iTime)')
                        expect(def).toContain('sin(iTime)')
                })

                it('tiled UV pattern', () => {
                        const def = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const tiled = fract(uv.mul(float(8))).toVar()
                                const pattern = sin(tiled.x.mul(float(6.28))).mul(sin(tiled.y.mul(float(6.28))))
                                return vec4(vec3(pattern), float(1))
                        })
                        expect(def).toContain('fract(')
                        expect(def).toContain(' * f32(8.0)')
                        expect(def).toContain(' * f32(6.28)')
                })
        })

        describe('Color operation patterns', () => {
                it('color mixing pattern', () => {
                        const def = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const color1 = vec3(1, 0, 0)
                                const color2 = vec3(0, 0, 1)
                                const t = sin(iTime.add(uv.x.mul(float(10))))
                                        .mul(float(0.5))
                                        .add(float(0.5))
                                const mixed = mix(color1, color2, t)
                                return vec4(mixed, float(1))
                        })
                        expect(def).toContain('mix(')
                        expect(def).toContain('vec3f(1.0, 0.0, 0.0)')
                        expect(def).toContain('vec3f(0.0, 0.0, 1.0)')
                        expect(def).toContain(' * f32(0.5)) + f32(0.5)')
                })

                it('gradient pattern', () => {
                        const def = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const gradient = uv.x.toVar()
                                const red = vec3(1, 0, 0)
                                const green = vec3(0, 1, 0)
                                const blue = vec3(0, 0, 1)
                                const color = mix(red, green, gradient).toVar()
                                color.assign(mix(color, blue, uv.y))
                                return vec4(color, float(1))
                        })
                        expect(def).toContain('mix(')
                        expect(def).toContain('vec3f(1.0, 0.0, 0.0)')
                        expect(def).toContain('vec3f(0.0, 1.0, 0.0)')
                        expect(def).toContain('vec3f(0.0, 0.0, 1.0)')
                })

                it('HSV color space pattern', () => {
                        const def = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const hue = uv.x.mul(float(6.28))
                                const sat = uv.y
                                const val = float(1)
                                const c = sat.mul(val)
                                const x = c.mul(
                                        float(1).sub(
                                                fract(hue.div(float(1.047)))
                                                        .mul(float(2))
                                                        .sub(float(1))
                                                // .abs() // @TODO FIX
                                        )
                                )
                                const m = val.sub(c)
                                return vec4(vec3(c.add(m), x.add(m), m), float(1))
                        })
                        expect(def).toContain(' * f32(6.28)')
                        expect(def).toContain('fract(')
                        expect(def).toContain(' / f32(1.047)')
                        // expect(def).toContain('abs()') // @TODO FIX
                })
        })

        describe('Practical drawing patterns', () => {
                it('circle drawing pattern', () => {
                        const def = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const center = vec2(0.5, 0.5)
                                const radius = float(0.3)
                                const dist = uv.sub(center).length()
                                const circle = float(1).sub(dist.div(radius)).clamp(float(0), float(1))
                                return vec4(vec3(circle), float(1))
                        })
                        expect(def).toContain('vec2f(0.5, 0.5)')
                        expect(def).toContain('length(')
                        expect(def).toContain('clamp(')
                        expect(def).toContain(' / f32(0.3)')
                })

                it('noise-like pattern', () => {
                        const def = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const scaled = uv.mul(float(20)).toVar()
                                const noise = fract(
                                        sin(scaled.x.mul(float(12.9898)).add(scaled.y.mul(float(78.233)))).mul(
                                                float(43758.5)
                                        )
                                )
                                return vec4(vec3(noise), float(1))
                        })
                        expect(def).toContain(' * f32(20.0)')
                        expect(def).toContain('sin(')
                        expect(def).toContain(' * f32(12.9898)')
                        expect(def).toContain(' * f32(78.233)')
                        expect(def).toContain(' * f32(43758.5)')
                })

                it('wave pattern', () => {
                        const def = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const wave1 = sin(uv.x.mul(float(10)).add(iTime.mul(float(2))))
                                const wave2 = sin(uv.y.mul(float(8)).add(iTime.mul(float(1.5))))
                                const combined = wave1.mul(wave2).mul(float(0.5)).add(float(0.5))
                                return vec4(vec3(combined), float(1))
                        })
                        expect(def).toContain('sin(')
                        expect(def).toContain(' * f32(10.0)')
                        expect(def).toContain(' * f32(8.0)')
                        expect(def).toContain('iTime * f32(2.0)')
                        expect(def).toContain('iTime * f32(1.5)')
                })
        })
})
