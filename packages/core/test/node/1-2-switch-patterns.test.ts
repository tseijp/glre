import { describe, it, expect } from '@jest/globals'
import { float, int, Switch } from '../../src/node'
import { build } from '../../test-utils'

describe('Switch Patterns', () => {
        describe('Single case processing', () => {
                it('single case switch', () => {
                        const def = build(() => {
                                const x = int(1).toVar()
                                const result = float(0).toVar()
                                Switch(x).Case(int(1))(() => {
                                        result.assign(float(10))
                                })
                                return result
                        })
                        expect(def).toContain('switch (')
                        expect(def).toContain('case i32(1.0)')
                        expect(def).toContain('break')
                })

                it('case with assignment', () => {
                        const def = build(() => {
                                const value = int(2)
                                const output = float(0).toVar()
                                Switch(value).Case(int(2))(() => {
                                        output.assign(float(20))
                                })
                                return output
                        })
                        expect(def).toContain('case i32(2.0)')
                        expect(def).toContain(' = f32(20.0)')
                })
        })

        describe('Multiple value cases', () => {
                it('multiple cases for same action', () => {
                        const def = build(() => {
                                const x = int(1).toVar()
                                const result = float(0).toVar()
                                Switch(x).Case(
                                        int(1),
                                        int(2),
                                        int(3)
                                )(() => {
                                        result.assign(float(100))
                                })
                                return result
                        })
                        expect(def).toContain('case i32(1.0)')
                        expect(def).toContain('case i32(2.0)')
                        expect(def).toContain('case i32(3.0)')
                        expect(def).toContain(' = f32(100.0)')
                })

                it('different cases with different actions', () => {
                        const def = build(() => {
                                const x = int(0).toVar()
                                const result = float(0).toVar()
                                Switch(x)
                                        .Case(int(0))(() => {
                                                result.assign(float(5))
                                        })
                                        .Case(int(1))(() => {
                                                result.assign(float(15))
                                        })
                                        .Case(int(2))(() => {
                                        result.assign(float(25))
                                })
                                return result
                        })
                        expect(def).toContain('case i32(0.0)')
                        expect(def).toContain('case i32(1.0)')
                        expect(def).toContain('case i32(2.0)')
                        expect(def).toContain(' = f32(5.0)')
                        expect(def).toContain(' = f32(15.0)')
                        expect(def).toContain(' = f32(25.0)')
                })
        })

        describe('Default case processing', () => {
                it('switch with default case', () => {
                        const def = build(() => {
                                const x = int(99).toVar()
                                const result = float(0).toVar()
                                Switch(x)
                                        .Case(int(1))(() => {
                                                result.assign(float(10))
                                        })
                                        .Default(() => {
                                                result.assign(float(-1))
                                        })
                                return result
                        })
                        expect(def).toContain('case i32(1.0)')
                        expect(def).toContain('default:')
                        expect(def).toContain(' = f32(-1.0)')
                })

                it('comprehensive switch with cases and default', () => {
                        const def = build(() => {
                                const input = int(0).toVar()
                                const output = float(0).toVar()
                                Switch(input)
                                        .Case(int(0))(() => {
                                                output.assign(float(1))
                                        })
                                        .Case(
                                                int(1),
                                                int(2)
                                        )(() => {
                                                output.assign(float(2))
                                        })
                                        .Case(int(3))(() => {
                                                output.assign(float(3))
                                        })
                                        .Default(() => {
                                                output.assign(float(0))
                                        })
                                return output
                        })
                        expect(def).toContain('case i32(0.0)')
                        expect(def).toContain('case i32(1.0)')
                        expect(def).toContain('case i32(2.0)')
                        expect(def).toContain('case i32(3.0)')
                        expect(def).toContain('default:')
                })
        })

        describe('No fallthrough behavior', () => {
                it('implicit break statements', () => {
                        const def = build(() => {
                                const x = int(1).toVar()
                                const result = float(0).toVar()
                                Switch(x)
                                        .Case(int(1))(() => {
                                                result.assign(float(10))
                                        })
                                        .Case(int(2))(() => {
                                        result.assign(float(20))
                                })
                                return result
                        })
                        expect(def).toContain('case i32(1.0)')
                        expect(def).toContain('break')
                        expect(def).toContain('case i32(2.0)')
                        expect(def).toContain('break')
                })

                it('switch with complex expressions in cases', () => {
                        const def = build(() => {
                                const x = int(1).toVar()
                                const a = float(0).toVar()
                                const b = float(0).toVar()
                                Switch(x)
                                        .Case(int(1))(() => {
                                                a.assign(float(1))
                                                b.assign(a.mul(float(2)))
                                        })
                                        .Case(int(2))(() => {
                                        a.assign(float(3))
                                        b.assign(a.add(float(1)))
                                })
                                return a.add(b)
                        })
                        expect(def).toContain('case i32(1.0)')
                        expect(def).toContain(' = f32(1.0)')
                        expect(def).toContain(' * f32(2.0)')
                        expect(def).toContain('case i32(2.0)')
                        expect(def).toContain(' = f32(3.0)')
                        expect(def).toContain(' + f32(1.0)')
                })
        })
})
