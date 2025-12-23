import { describe, it, expect } from '@jest/globals'
import { float, vec3, int, bool, Fn } from '../../src/node'
import { build, inferAndCode } from '../../test-utils'

describe('Function Definition System', () => {
        describe('Basic Function Definition', () => {
                it('should create simple function definitions correctly', () => {
                        const addFunc = Fn(([x, y]) => {
                                return x.add(y)
                        })
                        const res = build(() => {
                                const a = float(1.0)
                                const b = float(2.0)
                                return addFunc(a, b)
                        })
                        expect(res).toContain('fn ')
                        expect(res).toContain('return ')
                        expect(res).toMatch(/\(.*\+.*\)/)
                })

                it('should infer return types automatically', () => {
                        const vectorFunc = Fn(([x]) => {
                                return x.normalize()
                        })
                        const res = build(() => {
                                const v = vec3(1, 2, 3)
                                return vectorFunc(v)
                        })
                        expect(res).toContain('normalize')
                        expect(res).toContain('vec3f')
                })

                it('should handle void functions correctly', () => {
                        const voidFunc = Fn(([x]) => {
                                x.assign(float(0.0))
                        })
                        const res = build(() => {
                                const value = float(5.0).toVar('value')
                                voidFunc(value)
                                return value
                        })
                        expect(res).toContain('fn ')
                        expect(res).not.toContain('return')
                })
        })

        describe('Function Layout Specification', () => {
                it('should handle explicit layout specification correctly', () => {
                        const multiply = Fn(([a, b]) => {
                                return a.mul(b)
                        }).setLayout({
                                name: 'multiply',
                                type: 'float',
                                inputs: [
                                        { name: 'first', type: 'float' },
                                        { name: 'second', type: 'float' },
                                ],
                        })
                        const res = build(() => {
                                return multiply(float(3.0), float(4.0))
                        })
                        expect(res).toContain('multiply')
                        expect(res).toContain('first')
                        expect(res).toContain('second')
                        expect(res).toContain('f32')
                })

                it('should handle auto type inference in layout', () => {
                        const autoFunc = Fn(([x]) => {
                                return x.sin()
                        }).setLayout({
                                name: 'trigFunc',
                                type: 'auto',
                                inputs: [{ name: 'input', type: 'auto' }],
                        })
                        const res = build(() => {
                                return autoFunc(vec3(1, 2, 3))
                        })
                        expect(res).toContain('trigFunc')
                        expect(res).toContain('input')
                        expect(res).toContain('sin')
                })

                it('should validate layout name consistency', () => {
                        const namedFunc = Fn(([x, y]) => {
                                return x.dot(y)
                        }).setLayout({
                                name: 'dotProduct',
                                type: 'float',
                                inputs: [
                                        { name: 'vectorA', type: 'vec3' },
                                        { name: 'vectorB', type: 'vec3' },
                                ],
                        })
                        const res = build(() => {
                                const v1 = vec3(1, 0, 0)
                                const v2 = vec3(0, 1, 0)
                                return namedFunc(v1, v2)
                        })
                        expect(res).toContain('dotProduct')
                        expect(res).toContain('vectorA')
                        expect(res).toContain('vectorB')
                })
        })

        describe('Parameter Handling', () => {
                it('should handle multiple parameter types correctly', () => {
                        const mixedFunc = Fn(([scalar, vector, flag]) => {
                                const scaled = vector.mul(scalar)
                                return flag.select(scaled, vector)
                        }).setLayout({
                                name: 'conditionalScale',
                                type: 'vec3',
                                inputs: [
                                        { name: 'scale', type: 'float' },
                                        { name: 'vec', type: 'vec3' },
                                        { name: 'doScale', type: 'bool' },
                                ],
                        })
                        const res = build(() => {
                                return mixedFunc(float(2.0), vec3(1, 2, 3), bool(true))
                        })
                        expect(res).toContain('scale')
                        expect(res).toContain('vec')
                        expect(res).toContain('doScale')
                        expect(res).toContain('select')
                })

                it('should handle parameter binding correctly', () => {
                        const paramFunc = Fn(([x, y]) => {
                                const temp = x.add(y).toVar('temp')
                                return temp.mul(float(2.0))
                        })
                        const res = build(() => {
                                return paramFunc(float(1.0), float(3.0))
                        })
                        expect(res).toContain('temp')
                        expect(res).toMatch(/p0.*p1/)
                })

                it('should handle single parameter functions', () => {
                        const unaryFunc = Fn(([x]) => {
                                return x.abs().sqrt()
                        })
                        const res = build(() => {
                                return unaryFunc(float(-4.0))
                        })
                        expect(res).toContain('abs')
                        expect(res).toContain('sqrt')
                })

                it('should handle zero parameter functions', () => {
                        const constantFunc = Fn(() => {
                                return float(3.14159)
                        })
                        const res = build(() => {
                                return constantFunc()
                        })
                        expect(res).toContain('3.14159')
                })
        })

        describe('return  Type Inference', () => {
                it('should infer scalar return types correctly', () => {
                        const scalarFunc = Fn(([x]) => {
                                return x.length()
                        })
                        const { wgsl } = inferAndCode(scalarFunc(vec3(1, 2, 3)))
                        expect(wgsl).toContain('length')
                })

                it('should infer vector return types correctly', () => {
                        const vectorFunc = Fn(([x, y]) => {
                                return x.cross(y)
                        })
                        const { wgsl } = inferAndCode(vectorFunc(vec3(1, 0, 0), vec3(0, 1, 0)))
                        expect(wgsl).toContain('cross')
                })

                it('should infer boolean return types correctly', () => {
                        const boolFunc = Fn(([x, y]) => {
                                return x.greaterThan(y)
                        })
                        const { wgsl } = inferAndCode(boolFunc(float(5.0), float(3.0)))
                        expect(wgsl).toContain('>')
                })

                it('should handle complex expression return type inference', () => {
                        const complexFunc = Fn(([x, y]) => {
                                const diff = x.sub(y)
                                const normalized = diff.normalize()
                                return normalized.mul(float(0.5))
                        })
                        const res = build(() => {
                                return complexFunc(vec3(1, 2, 3), vec3(4, 5, 6))
                        })
                        expect(res).toContain('normalize')
                        expect(res).toContain('0.5')
                })
        })

        describe('Nested Function Definitions', () => {
                it('should handle nested function calls correctly', () => {
                        const innerFunc = Fn(([x]) => {
                                return x.sin()
                        })
                        const outerFunc = Fn(([y]) => {
                                return innerFunc(y).cos()
                        })
                        const res = build(() => {
                                return outerFunc(float(1.0))
                        })
                        expect(res).toContain('sin')
                        expect(res).toContain('cos')
                })

                it('should handle recursive-like function structures', () => {
                        const stepFunc = Fn(([value, threshold]) => {
                                return value.step(threshold)
                        })
                        const processFunc = Fn(([x]) => {
                                const stepped = stepFunc(x, float(0.5))
                                return stepped.mul(x)
                        })
                        const res = build(() => {
                                return processFunc(float(0.75))
                        })
                        expect(res).toContain('step')
                })
        })

        describe('Function Scope and Variable Access', () => {
                it('should isolate function variable scope correctly', () => {
                        const isolatedFunc = Fn(([input]) => {
                                const local = input.mul(float(2.0)).toVar('localVar')
                                const res = local.add(float(1.0))
                                return res
                        })
                        const res = build(() => {
                                const external = float(5.0).toVar('external')
                                const computed = isolatedFunc(external)
                                return computed
                        })
                        expect(res).toContain('localVar')
                        expect(res).toContain('external')
                })

                it('should handle parameter shadowing correctly', () => {
                        const shadowFunc = Fn(([x]) => {
                                return x.add(float(1.0)).toVar('x')
                        })
                        const res = build(() => {
                                return shadowFunc(float(2.0))
                        })
                        expect(res).toContain('var x:')
                })

                it('should handle closure-like behavior with parameter access', () => {
                        const closureFunc = Fn(([factor]) => {
                                const innerFunc = Fn(([value]) => {
                                        return value.mul(factor)
                                })
                                return innerFunc(float(10.0))
                        })
                        const res = build(() => {
                                return closureFunc(float(3.0))
                        })
                        expect(res).toMatch(/.*\*.*/)
                })
        })

        describe('Function Type Conversion and Compatibility', () => {
                it('should handle type conversion in function parameters', () => {
                        const typedFunc = Fn(([x]) => {
                                return x.toVec3()
                        }).setLayout({
                                name: 'scalarToVector',
                                type: 'vec3',
                                inputs: [{ name: 'scalar', type: 'float' }],
                        })
                        const res = build(() => {
                                return typedFunc(float(1.0))
                        })
                        expect(res).toContain('scalarToVector')
                        expect(res).toContain('scalar')
                        expect(res).toContain('vec3f')
                })

                it('should handle implicit type promotion in function calls', () => {
                        const promotionFunc = Fn(([a, b]) => {
                                return a.add(b)
                        })
                        const res = build(() => {
                                const intVal = int(5)
                                const floatVal = float(2.5)
                                return promotionFunc(intVal.toFloat(), floatVal)
                        })
                        expect(res).toContain('f32')
                })
        })

        describe('Complex Function Combinations', () => {
                it('should handle mathematical function composition', () => {
                        const mathFunc = Fn(([x, y]) => {
                                const sum = x.add(y)
                                const product = x.mul(y)
                                const ratio = sum.div(product)
                                return ratio.abs()
                        }).setLayout({
                                name: 'complexMath',
                                type: 'float',
                                inputs: [
                                        { name: 'a', type: 'float' },
                                        { name: 'b', type: 'float' },
                                ],
                        })
                        const res = build(() => {
                                return mathFunc(float(3.0), float(4.0))
                        })
                        expect(res).toContain('complexMath')
                        expect(res).toContain('abs')
                })

                it('should handle vector processing functions', () => {
                        const vectorProcess = Fn(([v1, v2, t]) => {
                                const interpolated = v1.mix(v2, t)
                                const normalized = interpolated.normalize()
                                const scaled = normalized.mul(float(2.0))
                                return scaled
                        }).setLayout({
                                name: 'processVectors',
                                type: 'vec3',
                                inputs: [
                                        { name: 'start', type: 'vec3' },
                                        { name: 'end', type: 'vec3' },
                                        { name: 'factor', type: 'float' },
                                ],
                        })
                        const res = build(() => {
                                const start = vec3(1, 0, 0)
                                const end = vec3(0, 1, 0)
                                const t = float(0.5)
                                return vectorProcess(start, end, t)
                        })
                        expect(res).toContain('processVectors')
                        expect(res).toContain('mix')
                        expect(res).toContain('normalize')
                })

                it('should handle conditional function logic', () => {
                        const conditionalFunc = Fn(([value, threshold]) => {
                                const condition = value.greaterThan(threshold)
                                const high = value.mul(float(2.0))
                                const low = value.mul(float(0.5))
                                return high.select(low, condition)
                        })
                        const res = build(() => {
                                return conditionalFunc(float(0.75), float(0.5))
                        })
                        expect(res).toContain('select')
                        expect(res).toContain('>')
                })
        })
})
