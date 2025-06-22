import { describe, it, expect } from '@jest/globals'
import { float, vec3, int, If, Loop, Fn } from '../../src/node'

describe('Control flow', () => {
        describe('Conditional statements (If/Else/ElseIf)', () => {
                it('Basic If statement', () => {
                        const shader = Fn(() => {
                                const x = float(1).toVar()
                                const y = float(0).toVar()

                                If(x.greaterThan(float(0)), () => {
                                        y.assign(float(10))
                                })

                                return y
                        })

                        const result = shader()
                        expect(`${result}`).toContain('if')
                        expect(`${result}`).toContain('(1.0 > 0.0)')
                        expect(`${result}`).toContain('y = 10.0')
                })

                it('If-Else statement', () => {
                        const shader = Fn(() => {
                                const x = float(1).toVar()
                                const result = vec3(0).toVar()

                                If(x.equal(float(1)), () => {
                                        result.assign(vec3(1, 0, 0))
                                }).Else(() => {
                                        result.assign(vec3(0, 1, 0))
                                })

                                return result
                        })

                        const code = `${shader()}`
                        expect(code).toContain('if')
                        expect(code).toContain('else')
                })

                it('If-ElseIf-Else statement', () => {
                        const shader = Fn(() => {
                                const x = float(2).toVar()
                                const result = vec3(0).toVar()

                                If(x.lessThan(float(1)), () => {
                                        result.assign(vec3(1, 0, 0))
                                })
                                        .ElseIf(x.equal(float(2)), () => {
                                                result.assign(vec3(0, 1, 0))
                                        })
                                        .Else(() => {
                                                result.assign(vec3(0, 0, 1))
                                        })

                                return result
                        })

                        const code = `${shader()}`
                        expect(code).toContain('if')
                        expect(code).toContain('else if')
                        expect(code).toContain('else')
                })

                it('ElseIf after Else (unimplemented feature)', () => {
                        // ElseIf after Else does not work in current implementation
                        const shader = Fn(() => {
                                const x = float(2).toVar()
                                const result = vec3(0).toVar()

                                const ifStatement = If(x.equal(float(0)), () => {
                                        result.assign(vec3(1, 0, 0))
                                }).Else(() => {
                                        result.assign(vec3(0, 1, 0))
                                })

                                // ElseIf after Else is currently unimplemented
                                // ifStatement.ElseIf does not exist

                                return result
                        })

                        const code = `${shader()}`
                        expect(code).toContain('if')
                        expect(code).toContain('else')
                })
        })

        describe('Loops (Loop)', () => {
                it('Basic loop', () => {
                        const shader = Fn(() => {
                                const sum = float(0).toVar()

                                Loop(int(10), ({ i }) => {
                                        sum.assign(sum.add(i))
                                })

                                return sum
                        })

                        const code = `${shader()}`
                        expect(code).toContain('for')
                        expect(code).toContain('i < 10')
                        expect(code).toContain('sum = (sum + i)')
                })

                it('Nested loops', () => {
                        const shader = Fn(() => {
                                const result = float(0).toVar()

                                Loop(int(3), ({ i }) => {
                                        Loop(int(3), ({ i: j }) => {
                                                result.assign(result.add(i.mul(j)))
                                        })
                                })

                                return result
                        })

                        const code = `${shader()}`
                        expect(code).toContain('for')
                        expect(code.match(/for/g)?.length).toBeGreaterThanOrEqual(2)
                })

                it('Conditional statements within loops', () => {
                        const shader = Fn(() => {
                                const count = int(0).toVar()

                                Loop(int(10), ({ i }) => {
                                        If(i.mod(int(2)).equal(int(0)), () => {
                                                count.assign(count.add(int(1)))
                                        })
                                })

                                return count
                        })

                        const code = `${shader()}`
                        expect(code).toContain('for')
                        expect(code).toContain('if')
                        expect(code).toContain('mod')
                })
        })
})
