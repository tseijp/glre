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
import { build, inferAndCode } from './utils'

describe('Integration Tests', () => {
        describe('Complete shader generation', () => {
                it('basic fragment shader with uniforms', () => {
                        const def = build(() => {
                                const uColorA = uniform(vec3(1, 0, 0), 'colorA')
                                const uColorB = uniform(vec3(0, 0, 1), 'colorB')
                                const t = sin(iTime).mul(float(0.5)).add(float(0.5))
                                const color = mix(uColorA, uColorB, t)
                                return vec4(color, float(1))
                        })
                        // expect(def).toContain('var i') // @TODO FIX
                        expect(def).toContain('mix(')
                        expect(def).toContain('colorA')
                        expect(def).toContain('colorB')
                        expect(def).toContain('sin(iTime)')
                })

                it('animated shader with control flow', () => {
                        const def = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const color = vec3(0, 0, 0).toVar()
                                const t = iTime.mul(float(2))
                                If(uv.x.greaterThan(float(0.5)), () => {
                                        color.assign(vec3(sin(t), cos(t), float(0.5)))
                                }).Else(() => {
                                        color.assign(vec3(float(0.5), sin(t.add(float(1.57))), cos(t.add(float(1.57)))))
                                })
                                return vec4(color, float(1))
                        })
                        expect(def).toContain('if (')
                        expect(def).toContain(' > f32(0.5)')
                        expect(def).toContain('} else {')
                        expect(def).toContain('sin(')
                        expect(def).toContain('cos(')
                })
        })

        describe('Complex expression evaluation', () => {
                it('nested mathematical expressions', () => {
                        const def = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const centered = uv.sub(vec3(0.5, 0.5, 0)).toVar()
                                const radius = centered.length()
                                const angle = fract(radius.mul(float(8)).add(iTime)).mul(float(6.28))
                                const wave = sin(angle).mul(cos(angle.mul(float(2))))
                                const final = mix(vec3(0, 0, 0), vec3(1, 1, 1), wave.mul(float(0.5)).add(float(0.5)))
                                return vec4(final, float(1))
                        })
                        expect(def).toContain('length(')
                        expect(def).toContain('fract(')
                        expect(def).toContain(' * f32(8.0)')
                        expect(def).toContain(' * f32(6.28)')
                        expect(def).toContain('mix(')
                })

                it('loop with accumulation', () => {
                        const def = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const color = vec3(0, 0, 0).toVar()
                                Loop(int(5), ({ i }) => {
                                        const offset = i.toFloat().div(float(5))
                                        const sample = sin(uv.x.add(offset).mul(float(10)))
                                        color.assign(color.add(vec3(sample.mul(float(0.2)))))
                                })
                                return vec4(color, float(1))
                        })
                        expect(def).toContain('for (')
                        expect(def).toContain('i < i32(5.0)')
                        expect(def).toContain(' / f32(5.0)')
                        expect(def).toContain(' * f32(10.0)')
                        expect(def).toContain(' * f32(0.2)')
                })
        })

        describe('Practical rendering patterns', () => {
                it('multi-layer effect composition', () => {
                        const def = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const layer1 = sin(uv.x.mul(float(20)).add(iTime)).toVar()
                                const layer2 = cos(uv.y.mul(float(15)).add(iTime.mul(float(1.5)))).toVar()
                                const combined = layer1.mul(layer2).toVar()
                                const color = vec3(0.5, 0.7, 1).toVar()
                                color.assign(color.mul(combined.add(float(1)).mul(float(0.5))))
                                If(combined.greaterThan(float(0.3)), () => {
                                        color.assign(mix(color, vec3(1, 1, 0), float(0.3)))
                                })
                                return vec4(color, float(1))
                        })
                        expect(def).toContain('sin(')
                        expect(def).toContain('cos(')
                        expect(def).toContain(' * f32(20.0)')
                        expect(def).toContain(' * f32(15.0)')
                        expect(def).toContain('if (')
                        expect(def).toContain(' > f32(0.3)')
                })

                it('function-based modular shader', () => {
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
                        const def = build(() => {
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const n1 = noise(vec3(uv.mul(float(5)), iTime))
                                const n2 = noise(vec3(uv.mul(float(10)), iTime.mul(float(2))))
                                const combined = n1.mul(float(0.7)).add(n2.mul(float(0.3)))
                                const color = mix(vec3(0.2, 0.4, 0.8), vec3(0.8, 0.6, 0.2), combined)
                                return vec4(color, float(1))
                        })
                        expect(def).toContain('noise(')
                        expect(def).toContain(' * f32(5.0)')
                        expect(def).toContain(' * f32(10.0)')
                        expect(def).toContain(' * f32(0.7)')
                        expect(def).toContain(' * f32(0.3)')
                        expect(def).toContain('mix(')
                })

                it('reactive parameter shader', () => {
                        const def = build(() => {
                                const uSpeed = uniform(float(1), 'speed')
                                const uScale = uniform(float(1), 'scale')
                                const uColor = uniform(vec3(1, 1, 1), 'color')
                                const uv = position.xy.div(iResolution.xy).toVar()
                                const scaledUV = uv.mul(uScale).toVar()
                                const t = iTime.mul(uSpeed)
                                const pattern = sin(scaledUV.x.add(t)).mul(cos(scaledUV.y.add(t)))
                                const final = uColor.mul(pattern.add(float(1)).mul(float(0.5)))
                                return vec4(final, float(1))
                        })
                        expect(def).toContain('speed')
                        expect(def).toContain('scale')
                        expect(def).toContain('color')
                        expect(def).toContain('sin(')
                        expect(def).toContain('cos(')
                })
        })

        describe('Type consistency validation', () => {
                it('complex type inference chain', () => {
                        const x = vec3(1, 2, 3)
                        const y = x.xy.mul(float(2))
                        const z = y.length()
                        const w = sin(z).add(cos(z))
                        const { type: xType } = inferAndCode(x)
                        const { type: yType } = inferAndCode(y)
                        const { type: zType } = inferAndCode(z)
                        const { type: wType } = inferAndCode(w)
                        expect(xType).toBe('vec3')
                        expect(yType).toBe('vec2')
                        expect(zType).toBe('float')
                        expect(wType).toBe('float')
                })

                it('function composition type validation', () => {
                        const blend = Fn(([a, b, t]) => {
                                return a.mul(float(1).sub(t)).add(b.mul(t))
                        })
                        blend.setLayout({
                                name: 'blend',
                                type: 'vec3',
                                inputs: [
                                        { name: 'a', type: 'vec3' },
                                        { name: 'b', type: 'vec3' },
                                        { name: 't', type: 'float' },
                                ],
                        })
                        const result = blend(vec3(1, 0, 0), vec3(0, 1, 0), float(0.5))
                        const { type: resultType } = inferAndCode(result)
                        expect(resultType).toBe('vec3')
                })
        })
})
