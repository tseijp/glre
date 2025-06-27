import { describe, it, expect } from '@jest/globals'
import { float, vec2, vec3, position } from '../../src/node'
import { inferAndCode } from './utils'

describe('Operator Chain', () => {
        describe('Arithmetic operator chaining', () => {
                it('add.mul.div chain', () => {
                        const x = float(1)
                        const y = float(2)
                        const z = float(3)
                        const w = float(4)
                        const result = x.add(y).mul(z).div(w)
                        const { type, wgsl } = inferAndCode(result)
                        expect(type).toBe('float')
                        expect(wgsl).toBe('(((1.0 + 2.0) * 3.0) / 4.0)')
                })

                it('vec3 operator chain', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const z = float(2)
                        const result = x.add(y).mul(z)
                        const { type, wgsl } = inferAndCode(result)
                        expect(type).toBe('vec3')
                        expect(wgsl).toBe('((vec3f(1.0, 2.0, 3.0) + vec3f(4.0, 5.0, 6.0)) * 2.0)')
                })
        })

        describe('Comparison operator inference', () => {
                it('lessThan returns bool', () => {
                        const x = float(1)
                        const y = float(2)
                        const z = x.lessThan(y)
                        const { type, wgsl } = inferAndCode(z)
                        expect(type).toBe('bool')
                        expect(wgsl).toBe('(1.0 < 2.0)')
                })

                it('equal with vector types', () => {
                        const x = vec2(1, 2)
                        const y = vec2(1, 2)
                        const z = x.equal(y)
                        const { type, wgsl } = inferAndCode(z)
                        expect(type).toBe('bool')
                        expect(wgsl).toBe('(vec2f(1.0, 2.0) == vec2f(1.0, 2.0))')
                })
        })

        describe('Swizzle operation combinations', () => {
                it('position.xyz.xy.x swizzle chain', () => {
                        const x = position
                        const y = x.xyz
                        const z = y.xy
                        const w = z.x
                        const { type: type1, wgsl: wgsl1 } = inferAndCode(y)
                        const { type: type2, wgsl: wgsl2 } = inferAndCode(z)
                        const { type: type3, wgsl: wgsl3 } = inferAndCode(w)
                        expect(type1).toBe('vec3')
                        expect(type2).toBe('vec2')
                        expect(type3).toBe('float')
                        expect(wgsl1).toBe('position.xyz')
                        expect(wgsl2).toBe('position.xyz.xy')
                        expect(wgsl3).toBe('position.xyz.xy.x')
                })

                it('vec3 rgba swizzle', () => {
                        const x = vec3(1, 0, 0)
                        const y = x.rgb
                        const { type, wgsl } = inferAndCode(y)
                        expect(type).toBe('vec3')
                        expect(wgsl).toBe('vec3f(1.0, 0.0, 0.0).rgb')
                })
        })

        describe('Mixed operation chains', () => {
                it('swizzle with arithmetic', () => {
                        const x = vec3(1, 2, 3)
                        const y = x.xy.mul(float(2))
                        const { type, wgsl } = inferAndCode(y)
                        expect(type).toBe('vec2')
                        expect(wgsl).toBe('(vec3f(1.0, 2.0, 3.0).xy * 2.0)')
                })

                it('arithmetic with swizzle', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const z = x.add(y).xyz
                        const { type, wgsl } = inferAndCode(z)
                        expect(type).toBe('vec3')
                        expect(wgsl).toBe('(vec3f(1.0, 2.0, 3.0) + vec3f(4.0, 5.0, 6.0)).xyz')
                })
        })
})
