import { describe, it, expect } from '@jest/globals'
import { float, If, Loop, int } from '../../src/node'
import { build } from '../../test-utils'

describe('Control Flow', () => {
        describe('Conditional branching', () => {
                it('If statement', () => {
                        const def = build(() => {
                                const x = float(1).toVar('x')
                                If(x.greaterThan(float(0)), () => {
                                        x.assign(float(2))
                                })
                                return x
                        })
                        expect(def).toContain('if ((x > f32(0.0))) {')
                        expect(def).toContain('x = f32(2.0);')
                })

                it('If-ElseIf-Else chain', () => {
                        const def = build(() => {
                                const x = float(5).toVar('x')
                                const result = float(0).toVar('result')
                                If(x.lessThan(float(3)), () => {
                                        result.assign(float(1))
                                })
                                        .ElseIf(x.lessThan(float(7)), () => {
                                                result.assign(float(2))
                                        })
                                        .Else(() => {
                                                result.assign(float(3))
                                        })
                                return result
                        })
                        expect(def).toContain('if ((x < f32(3.0))) {')
                        expect(def).toContain('} else if ((x < f32(7.0))) {')
                        expect(def).toContain('} else {')
                })
        })

        describe('Loop structures', () => {
                it('fixed count loop', () => {
                        const def = build(() => {
                                const sum = float(0).toVar('sum')
                                Loop(int(5), ({ i }) => {
                                        sum.assign(sum.add(i))
                                })
                                return sum
                        })
                        expect(def).toContain('for (var i: i32 = 0; i < i32(5.0); i++) {')
                })

                it('nested structures', () => {
                        const def = build(() => {
                                const x = float(5).toVar('x')
                                const y = float(3).toVar('y')
                                If(x.greaterThan(float(0)), () => {
                                        If(y.greaterThan(float(0)), () => {
                                                x.assign(x.add(y))
                                        })
                                })
                                return x
                        })
                        expect(def).toContain('if ((x > f32(0.0))) {')
                        expect(def).toContain('if ((y > f32(0.0))) {')
                })
        })
})
