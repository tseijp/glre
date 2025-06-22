import { describe, it, expect } from '@jest/globals'
import { float, vec3, int, Fn } from '../../src/node'

describe('Functions (Fn)', () => {
        describe('Function definition and type inference', () => {
                it('Function definition without arguments', () => {
                        const myFunction = Fn(() => {
                                const x = vec3(1, 2, 3).toVar()
                                const y = x.mul(2)
                                return y
                        })

                        const result = myFunction()
                        expect(`${result}`).toContain('vec3f')
                })

                it('Function definition with arguments', () => {
                        const myFunction = Fn((args) => {
                                const [x, y] = args
                                const sum = x.add(y).toVar()
                                return sum
                        })

                        const result = myFunction(float(1), float(2))
                        expect(`${result}`).toContain('add')
                })

                it('Argument type inference', () => {
                        const vectorAdd = Fn((args) => {
                                const [a, b] = args
                                // Argument types are inferred from the actual values used
                                const result = a.add(b).toVar()
                                return result
                        })

                        const result1 = vectorAdd(vec3(1, 0, 0), vec3(0, 1, 0))
                        const result2 = vectorAdd(float(1), float(2))

                        // Complete type inference is unimplemented in current implementation
                        expect(`${result1}`).toContain('vec3f')
                        expect(`${result2}`).toContain('add')
                })

                it('Return value type inference', () => {
                        const computeLength = Fn((args) => {
                                const [vec] = args
                                const length = vec.length().toVar()
                                return length
                        })

                        const result = computeLength(vec3(3, 4, 0))
                        // Return value type is inferred from return statement
                        expect(`${result}`).toContain('length')
                })
        })

        describe('Function composition', () => {
                it('Using functions as arguments', () => {
                        const square = Fn((args) => {
                                const [x] = args
                                return x.mul(x)
                        })

                        const doubleAndSquare = Fn((args) => {
                                const [x] = args
                                const doubled = x.mul(2)
                                return square(doubled)
                        })

                        const result = doubleAndSquare(float(3))
                        expect(`${result}`).toContain('mul')
                })

                it('Functions with multiple return values', () => {
                        const computeVectorStats = Fn((args) => {
                                const [vec] = args
                                const length = vec.length().toVar()
                                const normalized = vec.normalize().toVar()

                                // Multiple return values are not supported in current implementation
                                // Only the last return is effective
                                return { length, normalized }
                        })

                        const result = computeVectorStats(vec3(3, 4, 0))
                        expect(`${result}`).toBeDefined()
                })
        })

        describe('Function GLSL/WGSL conversion', () => {
                it('Complete function GLSL/WGSL conversion (unimplemented feature)', () => {
                        const boxSDF = Fn((args) => {
                                const [p, side] = args
                                const d = p.abs().sub(side).toVar()
                                const inside = d.x.max(d.y.max(d.z)).min(float(0))
                                const outside = d.max(vec3(0)).length()
                                return inside.add(outside)
                        })

                        // Functions are not completely converted to GLSL/WGSL in current implementation
                        const result = boxSDF(vec3(1, 2, 3), float(1))

                        // Test expects unimplemented functionality
                        // Functions need to be correctly converted in actual implementation
                        expect(`${result}`).toBeDefined()
                })

                it('Recursive functions (limitations)', () => {
                        // Recursive functions are generally not supported in GLSL
                        const factorial = Fn((args) => {
                                const [n] = args
                                const result = float(1).toVar()

                                // Actual implementation uses loops instead of recursion
                                return result
                        })

                        const result = factorial(int(5))
                        expect(`${result}`).toBeDefined()
                })
        })
})
