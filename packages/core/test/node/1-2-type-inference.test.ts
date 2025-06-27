import { describe, it, expect } from '@jest/globals'
import { float, vec2, vec3, sin, cos, dot, normalize, mix } from '../../src/node'
import { inferAndCode } from './utils'

describe('Type Inference', () => {
        describe('Function return type inference', () => {
                it('sin function preserves type', () => {
                        const x = float(1.57)
                        const y = sin(x)
                        const { type, wgsl } = inferAndCode(y)
                        expect(type).toBe('float')
                        expect(wgsl).toBe('sin(1.6)')
                })

                it('dot function returns scalar', () => {
                        const x = vec3(1, 0, 0)
                        const y = vec3(0, 1, 0)
                        const z = dot(x, y)
                        const { type, wgsl } = inferAndCode(z)
                        expect(type).toBe('float')
                        expect(wgsl).toBe('dot(vec3f(1.0, 0.0, 0.0), vec3f(0.0, 1.0, 0.0))')
                })

                it('normalize preserves vector type', () => {
                        const x = vec3(1, 2, 3)
                        const y = normalize(x)
                        const { type, wgsl } = inferAndCode(y)
                        expect(type).toBe('vec3')
                        expect(wgsl).toBe('normalize(vec3f(1.0, 2.0, 3.0))')
                })
        })

        describe('Operation result type promotion', () => {
                it('float * vec2 promotes to vec2', () => {
                        const x = float(2)
                        const y = vec2(1, 1)
                        const z = x.mul(y)
                        const { type, wgsl } = inferAndCode(z)
                        expect(type).toBe('vec2')
                        expect(wgsl).toBe('(2.0 * vec2f(1.0, 1.0))')
                })

                it('vec3 + float promotes to vec3', () => {
                        const x = vec3(1, 2, 3)
                        const y = float(0.5)
                        const z = x.add(y)
                        const { type, wgsl } = inferAndCode(z)
                        expect(type).toBe('vec3')
                        expect(wgsl).toBe('(vec3f(1.0, 2.0, 3.0) + 0.5)')
                })
        })

        describe('Nested expression type tracking', () => {
                it('complex expression type inference', () => {
                        const x = vec3(1, 0, 0)
                        const y = vec3(0, 1, 0)
                        const z = vec3(0, 0, 1)
                        const result = mix(x, y, float(0.5)).add(z)
                        const { type, wgsl } = inferAndCode(result)
                        expect(type).toBe('vec3')
                        expect(wgsl).toBe(
                                '(mix(vec3f(1.0, 0.0, 0.0), vec3f(0.0, 1.0, 0.0), 0.5) + vec3f(0.0, 0.0, 1.0))'
                        )
                })

                it('trigonometric with vector operations', () => {
                        const x = vec2(1, 2)
                        const y = sin(x.x).mul(cos(x.y))
                        const { type, wgsl } = inferAndCode(y)
                        expect(type).toBe('float')
                        expect(wgsl).toBe('(sin(vec2f(1.0, 2.0).x) * cos(vec2f(1.0, 2.0).y))')
                })
        })

        describe('Swizzle type inference', () => {
                it('vec3.xy returns vec2', () => {
                        const x = vec3(1, 2, 3)
                        const y = x.xy
                        const { type, wgsl } = inferAndCode(y)
                        expect(type).toBe('vec2')
                        expect(wgsl).toBe('vec3f(1.0, 2.0, 3.0).xy')
                })

                it('vec2.xxxx returns vec4', () => {
                        const x = vec2(1, 2)
                        const y = x.xxxx
                        const { type, wgsl } = inferAndCode(y)
                        expect(type).toBe('vec4')
                        expect(wgsl).toBe('vec2f(1.0, 2.0).xxxx')
                })

                it('single component returns float', () => {
                        const x = vec3(1, 2, 3)
                        const y = x.z
                        const { type, wgsl } = inferAndCode(y)
                        expect(type).toBe('float')
                        expect(wgsl).toBe('vec3f(1.0, 2.0, 3.0).z')
                })
        })
})
