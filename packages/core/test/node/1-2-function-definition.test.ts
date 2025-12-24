import { describe, expect, it } from '@jest/globals'
import { bool, float, Fn, int, vec3 } from '../../src/node'
import { build } from '../../test-utils'

describe('Function Definition System', () => {
        describe('Basic Function Definition', () => {
                it('should create simple function definitions correctly', () => {
                        const addFunc = Fn(([x, y]) => {
                                return x.add(y)
                        }).setLayout({ name: 'addFunc' })
                        const res = build(() => addFunc(float(1.0), float(2.0)), 'addFunc')
                        expect(res).toContain('fn ')
                        expect(res).toContain('return ')
                        expect(res).toMatch(/\(.*\+.*\)/)
                })

                it('should infer return types automatically', () => {
                        const vectorFunc = Fn(([x]) => {
                                return x.normalize()
                        }).setLayout({ name: 'vectorFunc' })
                        const res = build(() => vectorFunc(vec3(1, 2, 3)), 'vectorFunc')
                        expect(res).toContain('normalize')
                        expect(res).toContain('vec3f')
                })

                /**
                 * @TODO FIX #128 Unused-argument function calls aren't added to the scope, so no code is generated for them.
                it('should handle void functions correctly', () => {
                        const voidFunc = Fn(([x]) => {
                                x.assign(float(0.0))
                        }).setLayout({ name: 'voidFunc' })
                        const res = build(() => {
                                const value = float(5.0).toVar('value')
                                voidFunc(value) // argument is not add to scope
                                return value
                        }, 'voidFunc')
                        expect(res).toContain('fn ')
                        expect(res).not.toContain('return')
                })
                 */
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
                        const res = build(() => multiply(float(3.0), float(4.0)), 'multiply')
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
                        const res = build(() => autoFunc(vec3(1, 2, 3)), 'trigFunc')
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
                        const res = build(() => namedFunc(vec3(1, 0, 0), vec3(0, 1, 0)), 'dotProduct')
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
                        const res = build(() => mixedFunc(float(2.0), vec3(1, 2, 3), bool(true)), 'conditionalScale')
                        expect(res).toContain('scale')
                        expect(res).toContain('vec')
                        expect(res).toContain('doScale')
                        expect(res).toContain('select')
                })

                it('should handle parameter binding correctly', () => {
                        const paramFunc = Fn(([x, y]) => {
                                const temp = x.add(y).toVar('temp')
                                return temp.mul(float(2.0))
                        }).setLayout({ name: 'paramFunc' })
                        const res = build(() => paramFunc(float(1.0), float(3.0)), 'paramFunc')
                        expect(res).toContain('temp')
                        expect(res).toMatch(/p0.*p1/)
                })

                it('should handle single parameter functions', () => {
                        const unaryFunc = Fn(([x]) => {
                                return x.abs().sqrt()
                        }).setLayout({ name: 'unaryFunc' })
                        const res = build(() => unaryFunc(float(-4.0)), 'unaryFunc')
                        expect(res).toContain('abs')
                        expect(res).toContain('sqrt')
                })

                it('should handle zero parameter functions', () => {
                        const constantFunc = Fn(() => {
                                return float(3.14159)
                        }).setLayout({ name: 'constantFunc' })
                        const res = build(() => constantFunc(), 'constantFunc')
                        expect(res).toContain('3.14159')
                })
        })

        describe('return Type Inference', () => {
                it('should infer scalar return types correctly', () => {
                        const scalarFunc = Fn(([x]) => {
                                return x.length()
                        }).setLayout({ name: 'scalarFunc' })
                        const res = build(() => scalarFunc(vec3(1, 2, 3)), 'scalarFunc')
                        expect(res).toContain('length')
                })

                it('should infer vector return types correctly', () => {
                        const vectorFunc = Fn(([x, y]) => {
                                return x.cross(y)
                        }).setLayout({ name: 'vectorFunc' })
                        const res = build(() => vectorFunc(vec3(1, 0, 0), vec3(0, 1, 0)), 'vectorFunc')
                        expect(res).toContain('cross')
                })

                it('should infer boolean return types correctly', () => {
                        const boolFunc = Fn(([x, y]) => {
                                return x.greaterThan(y)
                        }).setLayout({ name: 'boolFunc' })
                        const res = build(() => boolFunc(float(5.0), float(3.0)), 'boolFunc')
                        expect(res).toContain('>')
                })

                it('should handle complex expression return type inference', () => {
                        const complexFunc = Fn(([x, y]) => {
                                const diff = x.sub(y)
                                const normalized = diff.normalize()
                                return normalized.mul(float(0.5))
                        }).setLayout({ name: 'complexFunc' })
                        const res = build(() => complexFunc(vec3(1, 2, 3), vec3(4, 5, 6)), 'complexFunc')
                        expect(res).toContain('normalize')
                        expect(res).toContain('0.5')
                })
        })

        describe('Nested Function Definitions', () => {
                it('should handle nested function calls correctly', () => {
                        const innerFunc = Fn(([x]) => {
                                return x.sin()
                        }).setLayout({ name: 'innerFunc' })
                        const outerFunc = Fn(([y]) => {
                                return innerFunc(y).cos()
                        }).setLayout({ name: 'outerFunc' })
                        const res0 = build(() => outerFunc(float(1.0)), 'innerFunc')
                        const res1 = build(() => outerFunc(float(1.0)), 'outerFunc')
                        expect(res0).toContain('sin')
                        expect(res1).toContain('cos')
                })

                it('should handle recursive-like function structures', () => {
                        const stepFunc = Fn(([value, threshold]) => {
                                return value.step(threshold)
                        }).setLayout({ name: 'stepFunc' })
                        const processFunc = Fn(([x]) => {
                                const stepped = stepFunc(x, float(0.5))
                                return stepped.mul(x)
                        })
                        const res = build(() => processFunc(float(0.75)), 'stepFunc')
                        expect(res).toContain('step')
                })
        })

        describe('Function Scope and Variable Access', () => {
                it('should isolate function variable scope correctly', () => {
                        const isolatedFunc = Fn(([input]) => {
                                const local = input.mul(float(2.0)).toVar('localVar')
                                return local.add(float(1.0))
                        }).setLayout({ name: 'isolatedFunc' })
                        const res = build(() => {
                                const external = float(5.0).toVar('external')
                                const computed = isolatedFunc(external)
                                return computed
                        }, 'isolatedFunc')
                        expect(res).toContain('localVar')
                })

                it('should handle parameter shadowing correctly', () => {
                        const shadowFunc = Fn(([x]) => {
                                return x.add(float(1.0)).toVar('x')
                        }).setLayout({ name: 'shadowFunc' })
                        const res = build(() => shadowFunc(float(2.0)), 'shadowFunc')
                        expect(res).toContain('var x:')
                })

                it('should handle closure-like behavior with parameter access', () => {
                        const closureFunc = Fn(([factor]) => {
                                const innerFunc = Fn(([value]) => {
                                        return value.mul(factor)
                                }).setLayout({ name: 'innerFunc' })
                                return innerFunc(float(10.0))
                        })
                        const res = build(() => closureFunc(float(3.0)), 'innerFunc')
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
                        }).setLayout({ name: 'promotionFunc' })
                        const res = build(() => promotionFunc(int(5).toFloat(), float(2.5)), 'promotionFunc')
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
                        const res = build(() => mathFunc(float(3.0), float(4.0)), 'complexMath')
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
                        const res = build(() => vectorProcess(vec3(1, 0, 0), vec3(0, 1, 0), float(0.5)), 'processVectors')
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
                        }).setLayout({ name: 'conditionalFunc' })
                        const res = build(() => conditionalFunc(float(0.75), float(0.5)), 'conditionalFunc')
                        expect(res).toContain('select')
                        expect(res).toContain('>')
                })
        })
})
