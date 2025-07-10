import { describe, it, expect } from '@jest/globals'
import { float, vec2, vec3, sin, cos, dot, normalize, mix, NodeProxy } from '../../src/node'
import { inferAndCode } from '../../test-utils'

describe('Type Inference', () => {
        describe('Function return types', () => {
                it('preserves input type', () => {
                        const x: NodeProxy<'float'> = sin(float(1.57))
                        const y: NodeProxy<'vec3'> = normalize(vec3(1, 2, 3))
                        expect(inferAndCode(x).type).toBe('float')
                        expect(inferAndCode(y).type).toBe('vec3')
                })

                it('returns scalar', () => {
                        const x: NodeProxy<'float'> = dot(vec3(1, 0, 0), vec3(0, 1, 0))
                        expect(inferAndCode(x).type).toBe('float')
                })

                it('highest type promotion', () => {
                        const x: NodeProxy<'vec3'> = mix(vec3(1, 0, 0), vec3(0, 1, 0), float(0.5))
                        expect(inferAndCode(x).type).toBe('vec3')
                })
        })

        describe('Complex expressions', () => {
                it('nested operations', () => {
                        const x: NodeProxy<'vec3'> = mix(vec3(1, 0, 0), vec3(0, 1, 0), float(0.5)).add(vec3(0, 0, 1))
                        const y: NodeProxy<'float'> = sin(vec2(1, 2).x).mul(cos(vec2(1, 2).y))
                        expect(inferAndCode(x).type).toBe('vec3')
                        expect(inferAndCode(y).type).toBe('float')
                })
        })

        describe('Swizzle inference', () => {
                it('component count', () => {
                        const x: NodeProxy<'vec2'> = vec3(1, 2, 3).xy
                        const y: NodeProxy<'vec4'> = vec2(1, 2).xxxx
                        const z: NodeProxy<'float'> = vec3(1, 2, 3).z
                        expect(inferAndCode(x).type).toBe('vec2')
                        expect(inferAndCode(y).type).toBe('vec4')
                        expect(inferAndCode(z).type).toBe('float')
                })
        })
})
