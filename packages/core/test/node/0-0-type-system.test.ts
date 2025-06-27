import { describe, it, expect } from '@jest/globals'
import { float, int, vec2, vec3, vec4, mat3, infer } from '../../src/node'
import { inferAndCode } from '../../test-utils'

describe('Type System', () => {
        describe('Primitive type creation', () => {
                it('float creation and infer', () => {
                        const x = float(1.5)
                        const { type, wgsl } = inferAndCode(x)
                        expect(type).toBe('float')
                        expect(wgsl).toBe('f32(1.5)')
                })

                it('int creation and infer', () => {
                        const x = int(42)
                        const { type, wgsl } = inferAndCode(x)
                        expect(type).toBe('int')
                        expect(wgsl).toBe('i32(42.0)')
                })

                it('vec3 creation and infer', () => {
                        const x = vec3(1, 2, 3)
                        const { type, wgsl } = inferAndCode(x)
                        expect(type).toBe('vec3')
                        expect(wgsl).toBe('vec3f(1.0, 2.0, 3.0)')
                })
        })

        describe('Type promotion', () => {
                it('float + vec3 → vec3', () => {
                        const x = float(2)
                        const y = vec3(1, 1, 1)
                        const z = x.add(y)
                        const { type, wgsl } = inferAndCode(z)
                        expect(type).toBe('vec3')
                        expect(wgsl).toBe('(f32(2.0) + vec3f(1.0, 1.0, 1.0))')
                })

                it('vec2 * float → vec2', () => {
                        const x = vec2(1, 2)
                        const y = float(0.5)
                        const z = x.mul(y)
                        const { type, wgsl } = inferAndCode(z)
                        expect(type).toBe('vec2')
                        expect(wgsl).toBe('(vec2f(1.0, 2.0) * f32(0.5))')
                })
        })

        describe('Type conversion methods', () => {
                it('vec3.toVec2() conversion', () => {
                        const x = vec3(1, 2, 3)
                        const y = x.toVec2()
                        const { type, wgsl } = inferAndCode(y)
                        expect(type).toBe('vec2')
                        expect(wgsl).toBe('vec2f(vec3f(1.0, 2.0, 3.0))')
                })

                it('float.toInt() conversion', () => {
                        const x = float(3.14)
                        const y = x.toInt()
                        const { type, wgsl } = inferAndCode(y)
                        expect(type).toBe('int')
                        expect(wgsl).toBe('i32(f32(3.14))')
                })
        })

        describe('Matrix type handling', () => {
                it('mat3 creation and infer', () => {
                        const x = mat3(1, 0, 0, 0, 1, 0, 0, 0, 1)
                        const { type, wgsl } = inferAndCode(x)
                        expect(type).toBe('mat3')
                        expect(wgsl).toBe('mat3x3f(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0)')
                })

                it('mat3 * vec3 type inference', () => {
                        const x = mat3(1, 0, 0, 0, 1, 0, 0, 0, 1)
                        const y = vec3(1, 2, 3)
                        const z = x.mul(y)
                        const { type, wgsl } = inferAndCode(z)
                        expect(type).toBe('vec3')
                        expect(wgsl).toBe(
                                '(mat3x3f(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0) * vec3f(1.0, 2.0, 3.0))'
                        )
                })
        })
})
