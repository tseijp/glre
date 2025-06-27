import { describe, it, expect } from '@jest/globals'
import { float, vec3, If, Loop, bool, int } from '../../src/node'
import { build } from './utils'

describe('Control Flow', () => {
        describe('Simple conditional branching', () => {
                it('basic If statement', () => {
                        const def = build(() => {
                                const x = float(1).toVar()
                                If(x.greaterThan(float(0)), () => {
                                        x.assign(float(2))
                                })
                                return x
                        })
                        expect(def).toContain('if (')
                        expect(def).toContain(' > f32(0.0)')
                        expect(def).toContain(' = f32(2.0)')
                })

                it('If with return value', () => {
                        const def = build(() => {
                                const result = float(0).toVar()
                                If(bool(true), () => {
                                        result.assign(float(10))
                                })
                                return result
                        })
                        expect(def).toContain('if (bool(true))')
                        expect(def).toContain(' = f32(10.0)')
                })
        })

        describe('ElseIf chain processing', () => {
                it('If-ElseIf-Else chain', () => {
                        const def = build(() => {
                                const x = float(5).toVar()
                                const result = float(0).toVar()
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
                        expect(def).toContain('if (')
                        expect(def).toContain('} else if (')
                        expect(def).toContain('} else {')
                })

                it('multiple ElseIf conditions', () => {
                        const def = build(() => {
                                const x = float(1).toVar()
                                If(x.equal(float(1)), () => {
                                        x.assign(float(10))
                                })
                                        .ElseIf(x.equal(float(2)), () => {
                                                x.assign(float(20))
                                        })
                                        .ElseIf(x.equal(float(3)), () => {
                                                x.assign(float(30))
                                        })
                                return x
                        })
                        expect(def).toContain('} else if (')
                        expect(def).toContain('== f32(2.0)')
                        expect(def).toContain('== f32(3.0)')
                })
        })

        describe('Loop structure processing', () => {
                it('fixed count loop', () => {
                        const def = build(() => {
                                const sum = float(0).toVar()
                                Loop(int(5), ({ i }) => {
                                        sum.assign(sum.add(i))
                                })
                                return sum
                        })
                        expect(def).toContain('for (')
                        // expect(def).toContain('i < 5') // @TODO FIX
                        expect(def).toContain('i++')
                })

                it('conditional loop', () => {
                        const def = build(() => {
                                const x = float(1).toVar()
                                Loop(x.lessThan(float(10)), () => {
                                        x.assign(x.mul(float(2)))
                                })
                                return x
                        })
                        expect(def).toContain('for (')
                        expect(def).toContain(' < f32(10.0)')
                })
        })

        describe('Nested structure output', () => {
                it('nested If statements', () => {
                        const def = build(() => {
                                const x = float(5).toVar()
                                const y = float(3).toVar()
                                If(x.greaterThan(float(0)), () => {
                                        If(y.greaterThan(float(0)), () => {
                                                x.assign(x.add(y))
                                        })
                                })
                                return x
                        })
                        expect(def).toContain('if (')
                        expect(def).toContain(' > f32(0.0)')
                })

                it('nested Loop statements', () => {
                        const def = build(() => {
                                const sum = float(0).toVar()
                                Loop(int(3), () => {
                                        Loop(int(2), () => {
                                                sum.assign(sum.add(float(1)))
                                        })
                                })
                                return sum
                        })
                        expect(def).toContain('for (')
                        expect(def).toContain('i < i32(3.0)')
                        expect(def).toContain('i < i32(2.0)')
                })

                it('If inside Loop', () => {
                        const def = build(() => {
                                const result = vec3(0, 0, 0).toVar()
                                Loop(int(3), ({ i }) => {
                                        If(i.greaterThan(int(1)), () => {
                                                result.x = result.x.add(float(1))
                                        })
                                })
                                return result
                        })
                        expect(def).toContain('for (')
                        expect(def).toContain('if (')
                        expect(def).toContain(' > i32(1.0)')
                })
        })
})
