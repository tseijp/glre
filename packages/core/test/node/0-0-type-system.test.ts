import { describe, it, expect } from '@jest/globals'
import { float, int, vec2, vec3, vec4, mat3 } from '../../src/node'
import { inferAndCode } from '../../test-utils'

describe('Type System', () => {
        describe('Basic type creation', () => {
                it('primitive types', () => {
                        const x = float(1.5)
                        const y = int(42)
                        const z = vec3(1, 2, 3)
                        expect(inferAndCode(x).type).toBe('float')
                        expect(inferAndCode(y).type).toBe('int')
                        expect(inferAndCode(z).type).toBe('vec3')
                })

                it('vector construction', () => {
                        const x = vec2(1, 2)
                        const y = vec4(1, 2, 3, 4)
                        expect(inferAndCode(x).wgsl).toBe('vec2f(1.0, 2.0)')
                        expect(inferAndCode(y).wgsl).toBe('vec4f(1.0, 2.0, 3.0, 4.0)')
                })
        })

        describe('Type promotion', () => {
                it('scalar-vector operations', () => {
                        const x = float(2).add(vec3(1, 1, 1))
                        const y = vec2(1, 2).mul(float(0.5))
                        expect(inferAndCode(x).type).toBe('vec3')
                        expect(inferAndCode(y).type).toBe('vec2')
                })

                it('matrix-vector operations', () => {
                        const x = mat3(1, 0, 0, 0, 1, 0, 0, 0, 1)
                        const y = vec3(1, 2, 3)
                        const z = x.mul(y)
                        expect(inferAndCode(z).type).toBe('vec3')
                })
        })

        describe('Type conversions', () => {
                it('explicit conversions', () => {
                        const x = vec3(1, 2, 3).toVec2()
                        const y = float(3.14).toInt()
                        expect(inferAndCode(x).type).toBe('vec2')
                        expect(inferAndCode(y).type).toBe('int')
                })
        })
})
