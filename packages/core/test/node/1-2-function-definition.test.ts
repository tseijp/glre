import { describe, it, expect } from '@jest/globals'
import { float, vec3, int, bool, Fn, Return } from '../../src/node'
import { build, inferAndCode } from '../../test-utils'

describe('Function Definition System', () => {
        describe('Basic Function Definition', () => {
                it('should create simple function definitions correctly', () => {
                        const addFunc = Fn(([x, y]) => {
                                Return(x.add(y))
                        })

                        const result = build(() => {
                                const a = float(1.0)
                                const b = float(2.0)
                                Return(addFunc(a, b))
                        })

                        expect(result).toContain('fn ')
                        expect(result).toContain('return ')
                        expect(result).toMatch(/\(.*\+.*\)/)
                })

                it('should infer return types automatically', () => {
                        const vectorFunc = Fn(([x]) => {
                                Return(x.normalize())
                        })

                        const result = build(() => {
                                const v = vec3(1, 2, 3)
                                Return(vectorFunc(v))
                        })

                        expect(result).toContain('normalize')
                        expect(result).toContain('vec3f')
                })

                it('should handle void functions correctly', () => {
                        const voidFunc = Fn(([x]) => {
                                x.assign(float(0.0))
                        })

                        const result = build(() => {
                                const value = float(5.0).toVar('value')
                                voidFunc(value)
                                Return(value)
                        })

                        expect(result).toContain('fn ')
                        expect(result).not.toContain('return')
                })
        })

        describe('Function Layout Specification', () => {
                it('should handle explicit layout specification correctly', () => {
                        const multiply = Fn(([a, b]) => {
                                Return(a.mul(b))
                        }).setLayout({
                                name: 'multiply',
                                type: 'float',
                                inputs: [
                                        { name: 'first', type: 'float' },
                                        { name: 'second', type: 'float' },
                                ],
                        })

                        const result = build(() => {
                                Return(multiply(float(3.0), float(4.0)))
                        })

                        expect(result).toContain('multiply')
                        expect(result).toContain('first')
                        expect(result).toContain('second')
                        expect(result).toContain('f32')
                })

                it('should handle auto type inference in layout', () => {
                        const autoFunc = Fn(([x]) => {
                                Return(x.sin())
                        }).setLayout({
                                name: 'trigFunc',
                                type: 'auto',
                                inputs: [{ name: 'input', type: 'auto' }],
                        })

                        const result = build(() => {
                                Return(autoFunc(vec3(1, 2, 3)))
                        })

                        expect(result).toContain('trigFunc')
                        expect(result).toContain('input')
                        expect(result).toContain('sin')
                })

                it('should validate layout name consistency', () => {
                        const namedFunc = Fn(([x, y]) => {
                                Return(x.dot(y))
                        }).setLayout({
                                name: 'dotProduct',
                                type: 'float',
                                inputs: [
                                        { name: 'vectorA', type: 'vec3' },
                                        { name: 'vectorB', type: 'vec3' },
                                ],
                        })

                        const result = build(() => {
                                const v1 = vec3(1, 0, 0)
                                const v2 = vec3(0, 1, 0)
                                Return(namedFunc(v1, v2))
                        })

                        expect(result).toContain('dotProduct')
                        expect(result).toContain('vectorA')
                        expect(result).toContain('vectorB')
                })
        })

        describe('Parameter Handling', () => {
                it('should handle multiple parameter types correctly', () => {
                        const mixedFunc = Fn(([scalar, vector, flag]) => {
                                const scaled = vector.mul(scalar)
                                Return(flag.select(scaled, vector))
                        }).setLayout({
                                name: 'conditionalScale',
                                type: 'vec3',
                                inputs: [
                                        { name: 'scale', type: 'float' },
                                        { name: 'vec', type: 'vec3' },
                                        { name: 'doScale', type: 'bool' },
                                ],
                        })

                        const result = build(() => {
                                Return(mixedFunc(float(2.0), vec3(1, 2, 3), bool(true)))
                        })

                        expect(result).toContain('scale')
                        expect(result).toContain('vec')
                        expect(result).toContain('doScale')
                        expect(result).toContain('select')
                })

                it('should handle parameter binding correctly', () => {
                        const paramFunc = Fn(([x, y]) => {
                                const temp = x.add(y).toVar('temp')
                                Return(temp.mul(float(2.0)))
                        })

                        const result = build(() => {
                                Return(paramFunc(float(1.0), float(3.0)))
                        })

                        expect(result).toContain('temp')
                        expect(result).toMatch(/p0.*p1/)
                })

                it('should handle single parameter functions', () => {
                        const unaryFunc = Fn(([x]) => {
                                Return(x.abs().sqrt())
                        })

                        const result = build(() => {
                                Return(unaryFunc(float(-4.0)))
                        })

                        expect(result).toContain('abs')
                        expect(result).toContain('sqrt')
                })

                it('should handle zero parameter functions', () => {
                        const constantFunc = Fn(() => {
                                Return(float(3.14159))
                        })

                        const result = build(() => {
                                Return(constantFunc())
                        })

                        expect(result).toContain('3.14159')
                })
        })

        describe('Return Type Inference', () => {
                it('should infer scalar return types correctly', () => {
                        const scalarFunc = Fn(([x]) => {
                                Return(x.length())
                        })

                        const { wgsl } = inferAndCode(scalarFunc(vec3(1, 2, 3)))
                        expect(wgsl).toContain('length')
                })

                it('should infer vector return types correctly', () => {
                        const vectorFunc = Fn(([x, y]) => {
                                Return(x.cross(y))
                        })

                        const { wgsl } = inferAndCode(vectorFunc(vec3(1, 0, 0), vec3(0, 1, 0)))
                        expect(wgsl).toContain('cross')
                })

                it('should infer boolean return types correctly', () => {
                        const boolFunc = Fn(([x, y]) => {
                                Return(x.greaterThan(y))
                        })

                        const { wgsl } = inferAndCode(boolFunc(float(5.0), float(3.0)))
                        expect(wgsl).toContain('>')
                })

                it('should handle complex expression return type inference', () => {
                        const complexFunc = Fn(([x, y]) => {
                                const diff = x.sub(y)
                                const normalized = diff.normalize()
                                Return(normalized.mul(float(0.5)))
                        })

                        const result = build(() => {
                                Return(complexFunc(vec3(1, 2, 3), vec3(4, 5, 6)))
                        })

                        expect(result).toContain('normalize')
                        expect(result).toContain('0.5')
                })
        })

        describe('Nested Function Definitions', () => {
                it('should handle nested function calls correctly', () => {
                        const innerFunc = Fn(([x]) => {
                                Return(x.sin())
                        })

                        const outerFunc = Fn(([y]) => {
                                Return(innerFunc(y).cos())
                        })

                        const result = build(() => {
                                Return(outerFunc(float(1.0)))
                        })

                        expect(result).toContain('sin')
                        expect(result).toContain('cos')
                })

                it('should handle recursive-like function structures', () => {
                        const stepFunc = Fn(([value, threshold]) => {
                                Return(value.step(threshold))
                        })

                        const processFunc = Fn(([x]) => {
                                const stepped = stepFunc(x, float(0.5))
                                Return(stepped.mul(x))
                        })

                        const result = build(() => {
                                Return(processFunc(float(0.75)))
                        })

                        expect(result).toContain('step')
                })
        })

        describe('Function Scope and Variable Access', () => {
                it('should isolate function variable scope correctly', () => {
                        const isolatedFunc = Fn(([input]) => {
                                const local = input.mul(float(2.0)).toVar('localVar')
                                const result = local.add(float(1.0))
                                Return(result)
                        })

                        const result = build(() => {
                                const external = float(5.0).toVar('external')
                                const computed = isolatedFunc(external)
                                Return(computed)
                        })

                        expect(result).toContain('localVar')
                        expect(result).toContain('external')
                })

                it('should handle parameter shadowing correctly', () => {
                        const shadowFunc = Fn(([x]) => {
                                return x.add(float(1.0)).toVar('x')
                        })

                        const result = build(() => {
                                Return(shadowFunc(float(2.0)))
                        })

                        expect(result).toContain('var x:')
                })

                it('should handle closure-like behavior with parameter access', () => {
                        const closureFunc = Fn(([factor]) => {
                                const innerFunc = Fn(([value]) => {
                                        Return(value.mul(factor))
                                })

                                Return(innerFunc(float(10.0)))
                        })

                        const result = build(() => {
                                Return(closureFunc(float(3.0)))
                        })

                        expect(result).toMatch(/.*\*.*/)
                })
        })

        describe('Function Type Conversion and Compatibility', () => {
                it('should handle type conversion in function parameters', () => {
                        const typedFunc = Fn(([x]) => {
                                Return(x.toVec3())
                        }).setLayout({
                                name: 'scalarToVector',
                                type: 'vec3',
                                inputs: [{ name: 'scalar', type: 'float' }],
                        })

                        const result = build(() => {
                                Return(typedFunc(float(1.0)))
                        })

                        expect(result).toContain('scalarToVector')
                        expect(result).toContain('scalar')
                        expect(result).toContain('vec3f')
                })

                it('should handle implicit type promotion in function calls', () => {
                        const promotionFunc = Fn(([a, b]) => {
                                Return(a.add(b))
                        })

                        const result = build(() => {
                                const intVal = int(5)
                                const floatVal = float(2.5)
                                Return(promotionFunc(intVal.toFloat(), floatVal))
                        })

                        expect(result).toContain('f32')
                })
        })

        describe('Complex Function Combinations', () => {
                it('should handle mathematical function composition', () => {
                        const mathFunc = Fn(([x, y]) => {
                                const sum = x.add(y)
                                const product = x.mul(y)
                                const ratio = sum.div(product)
                                Return(ratio.abs())
                        }).setLayout({
                                name: 'complexMath',
                                type: 'float',
                                inputs: [
                                        { name: 'a', type: 'float' },
                                        { name: 'b', type: 'float' },
                                ],
                        })

                        const result = build(() => {
                                Return(mathFunc(float(3.0), float(4.0)))
                        })

                        expect(result).toContain('complexMath')
                        expect(result).toContain('abs')
                })

                it('should handle vector processing functions', () => {
                        const vectorProcess = Fn(([v1, v2, t]) => {
                                const interpolated = v1.mix(v2, t)
                                const normalized = interpolated.normalize()
                                const scaled = normalized.mul(float(2.0))
                                Return(scaled)
                        }).setLayout({
                                name: 'processVectors',
                                type: 'vec3',
                                inputs: [
                                        { name: 'start', type: 'vec3' },
                                        { name: 'end', type: 'vec3' },
                                        { name: 'factor', type: 'float' },
                                ],
                        })

                        const result = build(() => {
                                const start = vec3(1, 0, 0)
                                const end = vec3(0, 1, 0)
                                const t = float(0.5)
                                Return(vectorProcess(start, end, t))
                        })

                        expect(result).toContain('processVectors')
                        expect(result).toContain('mix')
                        expect(result).toContain('normalize')
                })

                it('should handle conditional function logic', () => {
                        const conditionalFunc = Fn(([value, threshold]) => {
                                const condition = value.greaterThan(threshold)
                                const high = value.mul(float(2.0))
                                const low = value.mul(float(0.5))
                                Return(high.select(low, condition))
                        })

                        const result = build(() => {
                                Return(conditionalFunc(float(0.75), float(0.5)))
                        })

                        expect(result).toContain('select')
                        expect(result).toContain('>')
                })
        })
})
