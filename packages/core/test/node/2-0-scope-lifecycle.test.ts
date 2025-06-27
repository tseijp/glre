import { describe, it, expect } from '@jest/globals'
import { float, vec3, Fn } from '../../src/node'
import { build } from './utils'

describe('Scope Lifecycle', () => {
        describe('Variable lifecycle in Fn scope', () => {
                it('toVar creates variable declaration', () => {
                        const def = build(() => {
                                const x = float(1).toVar()
                                return x
                        })
                        expect(def).toContain('var i')
                        expect(def).toContain('f32 = f32(1.0)')
                })

                it('assign creates assignment statement', () => {
                        const def = build(() => {
                                const x = float(0).toVar()
                                x.assign(float(5))
                                return x
                        })
                        expect(def).toContain('var i')
                        expect(def).toContain('f32 = f32(0.0)')
                        expect(def).toContain('i')
                        expect(def).toContain(' = f32(5.0)')
                })

                it('multiple variable declarations', () => {
                        const def = build(() => {
                                const x = float(1).toVar()
                                const y = float(2).toVar()
                                const z = x.add(y).toVar()
                                return z
                        })
                        expect(def).toContain('var i')
                        expect(def).toContain('var i')
                        expect(def).toContain('var i')
                })
        })

        describe('Variable scope access', () => {
                it('variable used after declaration', () => {
                        const def = build(() => {
                                const x = float(2).toVar()
                                const y = x.mul(float(3))
                                return y
                        })
                        expect(def).toContain('var i')
                        expect(def).toContain('f32 = f32(2.0)')
                        expect(def).toContain('return (i')
                        expect(def).toContain(' * f32(3.0))')
                })

                it('swizzle assignment', () => {
                        const def = build(() => {
                                const x = vec3(1, 2, 3).toVar()
                                x.x = float(5)
                                return x
                        })
                        expect(def).toContain('var i')
                        expect(def).toContain('vec3f(1.0, 2.0, 3.0)')
                        expect(def).toContain('.x = f32(5.0)')
                })
        })

        describe('Return value handling', () => {
                it('simple return value', () => {
                        const def = build(() => {
                                return float(42)
                        })
                        expect(def).toContain('return f32(42.0)')
                })

                it('computed return value', () => {
                        const def = build(() => {
                                const x = float(5)
                                const y = float(7)
                                return x.add(y)
                        })
                        expect(def).toContain('return (f32(5.0) + f32(7.0))')
                })

                it('variable return value', () => {
                        const def = build(() => {
                                const x = float(10).toVar()
                                x.assign(x.mul(float(2)))
                                return x
                        })
                        expect(def).toContain('var i')
                        expect(def).toContain('return i')
                })
        })

        describe('Nested scope behavior', () => {
                it('Fn within Fn scope isolation', () => {
                        const innerFn = Fn(() => {
                                const x = float(1).toVar()
                                return x
                        })
                        innerFn.setLayout({ name: 'inner', type: 'float' })

                        const def = build(() => {
                                const y = float(2).toVar()
                                const result = innerFn()
                                return y.add(result)
                        })
                        expect(def).toContain('var i')
                        expect(def).toContain('inner()')
                })
        })
})
