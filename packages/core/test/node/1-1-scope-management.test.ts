import { describe, it, expect } from '@jest/globals'
import { float, vec3, int, bool, Fn, If, Loop, Switch, Scope, Break, Continue } from '../../src/node'
import { build } from '../../test-utils'

describe('Scope Management System', () => {
        describe('Variable Declaration with toVar', () => {
                it('should create variable declarations correctly', () => {
                        const res = build(() => {
                                return float(1.5).toVar('myFloat')
                        })
                        expect(res).toContain('var myFloat: f32 = 1.5;')
                        expect(res).toContain('return myFloat;')
                })

                it('should auto-generate variable names when not provided', () => {
                        const res = build(() => {
                                return vec3(1, 2, 3).toVar()
                        })
                        expect(res).toMatch(/var x\d+: vec3f = vec3f\(1\.0, 2\.0, 3\.0\);/)
                        expect(res).toMatch(/return x\d+;/)
                })

                it('should handle type inference in variable declarations', () => {
                        const res = build(() => {
                                const scalar = float(2.5)
                                const vector = vec3(1, 2, 3)
                                return scalar.mul(vector).toVar('res')
                        })
                        expect(res).toContain('var res: vec3f = (2.5 * vec3f(1.0, 2.0, 3.0));')
                })
        })

        describe('Assignment Operations with assign', () => {
                it('should create assignment statements correctly', () => {
                        const res = build(() => {
                                const x = vec3(1, 2, 3).toVar('position')
                                x.assign(vec3(4, 5, 6))
                                return x
                        })
                        expect(res).toContain('position = vec3f(4.0, 5.0, 6.0);')
                })

                it('should handle assignment with computed values', () => {
                        const res = build(() => {
                                const x = float(1.0).toVar('value')
                                const y = float(2.0)
                                x.assign(x.add(y))
                                return x
                        })
                        expect(res).toContain('value = (value + 2.0);')
                })
        })

        describe('Scope Creation with Scope', () => {
                it('should create isolated scopes correctly', () => {
                        const res = build(() => {
                                const x = float(1.0).toVar('outer')
                                Scope(() => {
                                        const y = float(2.0).toVar('inner')
                                        x.assign(y)
                                })
                                return x
                        })
                        expect(res).toContain('var inner: f32 = 2.0;')
                        expect(res).toContain('outer = inner;')
                })

                it('should handle nested scopes correctly', () => {
                        const res = build(() => {
                                const x = float(1.0).toVar('level0')
                                Scope(() => {
                                        const y = float(2.0).toVar('level1')
                                        Scope(() => {
                                                const z = float(3.0).toVar('level2')
                                                x.assign(y.add(z))
                                        })
                                })
                                return x
                        })
                        expect(res).toContain('var level1: f32 = 2.0;')
                        expect(res).toContain('var level2: f32 = 3.0;')
                        expect(res).toContain('level0 = (level1 + level2);')
                })
        })

        describe('Conditional Scopes with If', () => {
                it('should create if statements with proper scope isolation', () => {
                        const res = build(() => {
                                const x = float(1.0).toVar('value')
                                const condition = x.greaterThan(float(0.5))
                                If(condition, () => {
                                        const temp = float(10.0).toVar('temp')
                                        x.assign(temp)
                                })
                                return x
                        })

                        expect(res).toContain('if ((value > 0.5)) {')
                        expect(res).toContain('var temp: f32 = 10.0;')
                        expect(res).toContain('value = temp;')
                        expect(res).toContain('}')
                })

                it('should handle if-else chains correctly', () => {
                        const res = build(() => {
                                const x = float(1.0).toVar('value')
                                const condition1 = x.greaterThan(float(2.0))
                                const condition2 = x.greaterThan(float(1.0))
                                If(condition1, () => {
                                        x.assign(float(3.0))
                                })
                                        .ElseIf(condition2, () => {
                                                x.assign(float(2.0))
                                        })
                                        .Else(() => {
                                                x.assign(float(1.0))
                                        })
                                return x
                        })

                        expect(res).toContain('if ((value > 2.0)) {')
                        expect(res).toContain('} else if ((value > 1.0)) {')
                        expect(res).toContain('} else {')
                })

                it('should handle variable visibility in conditional scopes', () => {
                        const res = build(() => {
                                const x = float(0.0).toVar('res')
                                const condition = bool(true)
                                If(condition, () => {
                                        const inner = float(5.0).toVar('innerVar')
                                        x.assign(inner)
                                })
                                return x
                        })
                        expect(res).toContain('var innerVar: f32 = 5.0;')
                        expect(res).toContain('res = innerVar;')
                })
        })

        describe('Loop Scopes with Loop', () => {
                it('should create loop statements with proper scope management', () => {
                        const res = build(() => {
                                const sum = float(0.0).toVar('sum')
                                const count = int(5)
                                Loop(count, ({ i }) => {
                                        sum.addAssign(i.toFloat())
                                })
                                return sum
                        })
                        expect(res).toContain('for (var')
                        expect(res).toContain('i32 = 0')
                        expect(res).toContain('sum += f32(')
                })

                it('should handle loop variable access correctly', () => {
                        const res = build(() => {
                                const arr = vec3(0, 0, 0).toVar('array')
                                const size = int(3)
                                Loop(size, ({ i }) => {
                                        const value = i.toFloat().toVar('loopValue')
                                        arr.element(i).assign(value)
                                })
                                return arr
                        })

                        expect(res).toContain('var loopValue: f32 = f32(')
                })

                it('should handle nested loops correctly', () => {
                        const res = build(() => {
                                const total = float(0.0).toVar('total')
                                const outer = int(2)
                                const inner = int(3)
                                Loop(outer, ({ i }) => {
                                        Loop(inner, ({ i: j }) => {
                                                total.addAssign(i.add(j).toFloat())
                                        })
                                })
                                return total
                        })
                        expect(res).toMatch(/for[\s\S]*for/) // /for.*for/s
                })

                it('should handle Break and Continue statements', () => {
                        const res = build(() => {
                                const sum = float(0.0).toVar('sum')
                                const count = int(10)
                                Loop(count, ({ i }) => {
                                        If(i.greaterThan(int(5)), () => {
                                                Break()
                                        })
                                        If(i.equal(int(2)), () => {
                                                Continue()
                                        })
                                        sum.addAssign(i.toFloat())
                                })
                                return sum
                        })

                        expect(res).toContain('break;')
                        expect(res).toContain('continue;')
                })
        })

        describe('Switch Scopes', () => {
                it('should create switch statements with proper scope isolation', () => {
                        const res = build(() => {
                                const value = int(2).toVar('switchValue')
                                const res = float(0.0).toVar('res')
                                Switch(value)
                                        // @ts-ignore @TODO FIX #127 `Argument of type '() => void' is not assignable to parameter of type 'X'.`
                                        .Case(int(1), () => {
                                                res.assign(float(10.0))
                                        })
                                        // @ts-ignore @TODO FIX #127 `Property 'Case' does not exist on type '(fun: () => void) => { Case: (...values: X[]) => (fun: () => void) => ...; Default: (fun: () => void) => void; }'.`
                                        .Case(int(2), () => {
                                                res.assign(float(20.0))
                                        })
                                        .Default(() => {
                                                res.assign(float(0.0))
                                        })
                                return res
                        })

                        expect(res).toContain('switch (switchValue) {')
                        expect(res).toContain('case')
                        expect(res).toContain('default:')
                        expect(res).toContain('break;')
                })

                it('should handle multiple case values correctly', () => {
                        const res = build(() => {
                                const input = int(1).toVar('input')
                                const output = float(0.0).toVar('output')
                                Switch(input)
                                        // @ts-ignore @TODO FIX #127 `Argument of type '() => void' is not assignable to parameter of type 'X'.`
                                        .Case(int(1), int(2), () => {
                                                output.assign(float(1.0))
                                        })
                                        // @ts-ignore @TODO FIX #127 `Property 'Default' does not exist on type '(fun: () => void) => { Case: (...values: X[]) => (fun: () => void) => ...; Default: (fun: () => void) => void; }'.`
                                        .Default(() => {
                                                output.assign(float(-1.0))
                                        })
                                return output
                        })
                        expect(res).toContain('case')
                })
        })

        describe('Function Scope Isolation', () => {
                it('should isolate function scope from outer scope', () => {
                        const outer = float(5.0).toVar('outerVar')
                        const myFunc = Fn(([x]) => {
                                const inner = float(10.0).toVar('innerVar')
                                return x.add(inner)
                        })
                        const res = build(() => {
                                const callResult = myFunc(outer)
                                return callResult
                        })
                        expect(res).toContain('innerVar')
                        expect(res).toMatch(/fn.*innerVar/)
                })

                it('should handle parameter scope correctly', () => {
                        const addFunc = Fn(([a, b]) => {
                                const sum = a.add(b).toVar('sum')
                                return sum
                        }).setLayout({
                                name: 'addNumbers',
                                type: 'float',
                                inputs: [
                                        { name: 'first', type: 'float' },
                                        { name: 'second', type: 'float' },
                                ],
                        })
                        const res = build(() => {
                                const x = float(1.0)
                                const y = float(2.0)
                                return addFunc(x, y)
                        })
                        expect(res).toContain('addNumbers')
                        expect(res).toContain('first')
                        expect(res).toContain('second')
                })
        })

        describe('Complex Scope Interactions', () => {
                it('should handle multiple scope types together', () => {
                        const res = build(() => {
                                const counter = int(0).toVar('counter')
                                const max = int(3)
                                Loop(max, ({ i }) => {
                                        If(i.greaterThan(int(0)), () => {
                                                const temp = i.mul(int(2)).toVar('temp')
                                                counter.addAssign(temp)
                                        }).Else(() => {
                                                counter.assign(int(1))
                                        })
                                })
                                return counter.toFloat()
                        })
                        expect(res).toContain('for')
                        expect(res).toContain('if')
                        expect(res).toContain('else')
                        expect(res).toContain('var temp:')
                })

                it('should preserve variable access across scope boundaries', () => {
                        const res = build(() => {
                                const accumulator = float(0.0).toVar('acc')
                                const iterations = int(2)
                                Loop(iterations, ({ i }) => {
                                        If(i.equal(int(0)), () => {
                                                accumulator.assign(float(1.0))
                                        }).Else(() => {
                                                accumulator.mulAssign(float(2.0))
                                        })
                                })
                                return accumulator
                        })
                        expect(res).toContain('acc = 1.0;')
                        expect(res).toContain('acc *= 2.0;')
                })

                it('should handle deeply nested scopes correctly', () => {
                        const res = build(() => {
                                const res = float(0.0).toVar('res')
                                const outer = int(2)
                                Loop(outer, ({ i }) => {
                                        If(i.greaterThan(int(0)), () => {
                                                Loop(int(2), ({ i: j }) => {
                                                        If(j.equal(int(1)), () => {
                                                                res.addAssign(i.add(j).toFloat())
                                                        })
                                                })
                                        })
                                })
                                return res
                        })
                        expect(res).toMatch(/for[\s\S]*if[\s\S]*for[\s\S]*if/) // /for.*if.*for.*if/s
                })
        })
})
