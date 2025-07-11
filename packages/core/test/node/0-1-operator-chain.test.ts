import { describe, it, expect } from '@jest/globals'
import { float, vec2, vec3, position, NodeProxy } from '../../src/node'
import { inferAndCode } from '../../test-utils'

describe('Operator Chain', () => {
        describe('Arithmetic chains', () => {
                it('float operations', () => {
                        const x: NodeProxy<'float'> = float(1).add(float(2)).mul(float(3)).div(float(4))
                        const { type, wgsl } = inferAndCode(x)
                        expect(type).toBe('float')
                        expect(wgsl).toContain('(((f32(1.0) + f32(2.0)) * f32(3.0)) / f32(4.0))')
                })

                it('vector operations', () => {
                        const x: NodeProxy<'vec3'> = vec3(1, 2, 3).add(vec3(4, 5, 6)).mul(float(2))
                        const { type, wgsl } = inferAndCode(x)
                        expect(type).toBe('vec3')
                        expect(wgsl).toContain('vec3f(1.0, 2.0, 3.0)')
                })
        })

        describe('Comparison operators', () => {
                it('returns bool type', () => {
                        const x: NodeProxy<'bool'> = float(1).lessThan(float(2))
                        const y: NodeProxy<'bool'> = vec2(1, 2).equal(vec2(1, 2))
                        expect(inferAndCode(x).type).toBe('bool')
                        expect(inferAndCode(y).type).toBe('bool')
                })
        })

        describe('Swizzle operations', () => {
                it('component access', () => {
                        const x: NodeProxy<'vec3'> = position.xyz
                        const y: NodeProxy<'vec2'> = position.xyz.xy
                        const z: NodeProxy<'float'> = position.xyz.xy.x
                        expect(inferAndCode(x).type).toBe('vec3')
                        expect(inferAndCode(y).type).toBe('vec2')
                        expect(inferAndCode(z).type).toBe('float')
                })

                it('mixed operations', () => {
                        const x: NodeProxy<'vec2'> = vec3(1, 2, 3).xy.mul(float(2))
                        const y: NodeProxy<'vec3'> = vec3(1, 2, 3).add(vec3(4, 5, 6)).xyz
                        expect(inferAndCode(x).type).toBe('vec2')
                        expect(inferAndCode(y).type).toBe('vec3')
                })
        })
})
