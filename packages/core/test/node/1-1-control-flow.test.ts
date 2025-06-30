import { describe, it, expect } from '@jest/globals'
import { float, If, Loop, int } from '../../src/node'
import { build } from '../../test-utils'

describe('Control Flow', () => {
        describe('Conditional branching', () => {
                it('If statement', () => {
                        const wgsl = build(() => {
                                const x = float(1).toVar('x')
                                If(x.greaterThan(float(0)), () => {
                                        x.assign(float(2))
                                })
                                return x
                        })
                        expect(wgsl).toContain('fn fn() -> f32 {')
                        expect(wgsl).toContain('if ((x > f32(0.0))) {\nx = f32(2.0);')
                })

                it('If-ElseIf-Else chain', () => {
                        const wgsl = build(() => {
                                const x = float(5).toVar('x')
                                If(x.lessThan(float(3)), () => {
                                        return float(1)
                                })
                                        .ElseIf(x.lessThan(float(7)), () => {
                                                return float(2)
                                        })
                                        .Else(() => {
                                                return float(3)
                                        })
                        })
                        expect(wgsl).toContain('fn fn() -> f32 {')
                        expect(wgsl).toContain('if ((x < f32(3.0))) {\nreturn f32(1.0);')
                        expect(wgsl).toContain('} else if ((x < f32(7.0))) {\nreturn f32(2.0);')
                        expect(wgsl).toContain('} else {\nreturn f32(3.0);')
                })
        })

        describe('Loop structures', () => {
                it('fixed count loop', () => {
                        const wgsl = build(() => {
                                const sum = float(0).toVar('sum')
                                Loop(int(5), ({ i }) => {
                                        sum.assign(sum.add(i))
                                })
                                return sum
                        })
                        expect(wgsl).toContain('fn fn() -> f32 {')
                        expect(wgsl).toContain('for (var i: i32 = 0; i < i32(5.0); i++) {\nsum = (sum + i);')
                })

                it('nested structures', () => {
                        const wgsl = build(() => {
                                const x = float(5).toVar('x')
                                const y = float(3).toVar('y')
                                If(x.greaterThan(float(0)), () => {
                                        If(y.greaterThan(float(0)), () => {
                                                x.assign(x.add(y))
                                        })
                                })
                                return x
                        })
                        expect(wgsl).toContain('fn fn() -> f32 {')
                        expect(wgsl).toContain('if ((x > f32(0.0))) {\nif ((y > f32(0.0))) {\nx = (x + y);')
                })
        })
})
