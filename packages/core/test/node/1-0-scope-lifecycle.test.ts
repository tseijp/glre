import { describe, it, expect } from '@jest/globals'
import { float, vec3, Fn } from '../../src/node'
import { build } from '../../test-utils'

describe('Scope Lifecycle', () => {
        describe('Variable declarations', () => {
                it('toVar with explicit name', () => {
                        const wgsl = build(() => {
                                const x = float(1).toVar('x')
                                return x
                        })
                        expect(wgsl).toContain('fn fn() -> f32 {')
                        expect(wgsl).toContain('var x: f32 = f32(1.0)')
                        expect(wgsl).toContain('return x')
                })

                it('multiple variables', () => {
                        const wgsl = build(() => {
                                const x = float(1).toVar('x')
                                const y = float(2).toVar('y')
                                const z = x.add(y).toVar('z')
                                return z
                        })
                        expect(wgsl).toContain('var x: f32 = f32(1.0);')
                        expect(wgsl).toContain('var y: f32 = f32(2.0);')
                        expect(wgsl).toContain('var z: f32 = (x + y);')
                })
        })

        describe('Variable assignments', () => {
                it('assign operation', () => {
                        const wgsl = build(() => {
                                const x = float(0).toVar('x')
                                x.assign(float(5))
                                return x
                        })
                        expect(wgsl).toContain('x = f32(5.0)')
                })

                it('swizzle assignment', () => {
                        const wgsl = build(() => {
                                const x = vec3(1, 2, 3).toVar('x')
                                x.x = float(5)
                                return x
                        })
                        expect(wgsl).toContain('x.x = f32(5.0);')
                })
        })

        describe('Scope behavior', () => {
                it('variable usage', () => {
                        const wgsl = build(() => {
                                const x = float(2).toVar('x')
                                const y = x.mul(float(3))
                                return y
                        })
                        expect(wgsl).toContain('var x: f32 = f32(2.0);')
                        expect(wgsl).toContain('return (x * f32(3.0));')
                })

                it('nested function scope', () => {
                        const innerFn = Fn(() => {
                                const x = float(1).toVar('x')
                                return x
                        })
                        innerFn.setLayout({ name: 'inner', type: 'float' })
                        const wgsl = build(() => {
                                const y = float(2).toVar('y')
                                const result = innerFn()
                                return y.add(result)
                        })
                        expect(wgsl).toContain('return (y + inner());')
                })
        })
})
