import { describe, it, expect } from '@jest/globals'
import { float, int, Switch } from '../../src/node'
import { build } from '../../test-utils'

describe('Switch Patterns', () => {
        describe('Basic switch cases', () => {
                it('single case', () => {
                        const wgsl = build(() => {
                                const x = int(1).toVar('x')
                                const result = float(0).toVar('result')
                                Switch(x).Case(int(1))(() => {
                                        result.assign(float(10))
                                })
                                return result
                        })
                        expect(wgsl).toContain('switch (x) {')
                        expect(wgsl).toContain('case i32(1.0):')
                        expect(wgsl).toContain('break;')
                })

                it('multiple cases', () => {
                        const wgsl = build(() => {
                                const x = int(1).toVar('x')
                                const result = float(0).toVar('result')
                                Switch(x)
                                        .Case(int(1))(() => {
                                                result.assign(float(10))
                                        })
                                        .Case(int(2))(() => {
                                                result.assign(float(20))
                                        })
                                        .Default(() => {
                                                result.assign(float(-1))
                                        })
                                return result
                        })
                        expect(wgsl).toContain('case i32(1.0):')
                        expect(wgsl).toContain('case i32(2.0):')
                        expect(wgsl).toContain('default:')
                })
        })

        describe('Multi-value cases', () => {
                it('shared action cases', () => {
                        const wgsl = build(() => {
                                const x = int(1).toVar('x')
                                const result = float(0).toVar('result')
                                Switch(x).Case(
                                        int(1),
                                        int(2),
                                        int(3)
                                )(() => {
                                        result.assign(float(100))
                                })
                                return result
                        })
                        expect(wgsl).toContain('case i32(1.0):')
                        expect(wgsl).toContain('case i32(2.0):')
                        expect(wgsl).toContain('case i32(3.0):')
                        expect(wgsl).toContain('result = f32(100.0);')
                })
        })

        describe('Complex expressions', () => {
                it('multiple statements per case', () => {
                        const wgsl = build(() => {
                                const x = int(1).toVar('x')
                                const a = float(0).toVar('a')
                                const b = float(0).toVar('b')
                                Switch(x).Case(int(1))(() => {
                                        a.assign(float(1))
                                        b.assign(a.mul(float(2)))
                                })
                                return a.add(b)
                        })
                        expect(wgsl).toContain('a = f32(1.0);')
                        expect(wgsl).toContain('b = (a * f32(2.0));')
                })
        })
})
