import { describe, it, expect } from '@jest/globals'
import { float, vec3, int, If, Loop, Fn } from '../../src/node'

describe('Scope management', () => {
        describe('Variable scope', () => {
                it('Variables within Fn scope', () => {
                        const shader = Fn(() => {
                                const localVar = vec3(1, 2, 3).toVar('local')
                                return localVar
                        })

                        const result = shader()
                        expect(`${result}`).toContain('vec3f local')
                })

                it('Nested scopes', () => {
                        const shader = Fn(() => {
                                const outer = float(1).toVar('outer')

                                If(outer.greaterThan(float(0)), () => {
                                        const inner = float(2).toVar('inner')
                                        outer.assign(outer.add(inner))
                                })

                                return outer
                        })

                        const code = `${shader()}`
                        expect(code).toContain('f32 outer')
                        expect(code).toContain('f32 inner')
                })

                it('Loop scope', () => {
                        const shader = Fn(() => {
                                const sum = float(0).toVar('sum')

                                Loop(int(5), ({ i }) => {
                                        const temp = i.mul(float(2)).toVar('temp')
                                        sum.assign(sum.add(temp))
                                })

                                return sum
                        })

                        const code = `${shader()}`
                        expect(code).toContain('f32 sum')
                        expect(code).toContain('f32 temp')
                })
        })

        describe('Scope separation', () => {
                it('Same-named variables in different scopes', () => {
                        const shader = Fn(() => {
                                const result = float(0).toVar('result')

                                If(float(1).equal(float(1)), () => {
                                        const result = float(10).toVar('result')
                                        // result in inner scope
                                })

                                If(float(2).equal(float(2)), () => {
                                        const result = float(20).toVar('result')
                                        // result in another inner scope
                                })

                                return result
                        })

                        const code = `${shader()}`
                        expect(code).toContain('f32 result')
                })

                it('Scope separation between functions', () => {
                        const func1 = Fn(() => {
                                const x = float(1).toVar('x')
                                return x
                        })

                        const func2 = Fn(() => {
                                const x = float(2).toVar('x')
                                return x
                        })

                        const result1 = func1()
                        const result2 = func2()

                        expect(`${result1}`).toContain('f32 x = 1.0')
                        expect(`${result2}`).toContain('f32 x = 2.0')
                })
        })

        describe('Global vs local variables', () => {
                it('Variable reference error outside scope', () => {
                        // In current implementation, even if trying to reference variables outside scope
                        // it does not error but code is not generated correctly

                        const shader = Fn(() => {
                                const main = float(0).toVar('main')

                                If(float(1).equal(float(1)), () => {
                                        const local = float(5).toVar('local')
                                        main.assign(local)
                                })

                                // Referencing local here should cause an error
                                // const invalid = local // This currently does not error

                                return main
                        })

                        const code = `${shader()}`
                        expect(code).toContain('f32 main')
                        expect(code).toContain('f32 local')
                })

                it('Variable lifecycle within scope', () => {
                        const shader = Fn(() => {
                                const counter = int(0).toVar('counter')

                                Loop(int(3), ({ i }) => {
                                        const temp = i.mul(int(10)).toVar('temp')
                                        counter.assign(counter.add(temp))

                                        If(i.equal(int(1)), () => {
                                                const innerTemp = temp.add(int(100)).toVar('innerTemp')
                                                counter.assign(counter.add(innerTemp))
                                        })
                                })

                                return counter
                        })

                        const code = `${shader()}`
                        expect(code).toContain('i32 counter')
                        expect(code).toContain('i32 temp')
                        expect(code).toContain('i32 innerTemp')
                })
        })
})
