import { describe, it, expect } from '@jest/globals'
import { float, vec2, vec3, sin, cos, dot, normalize, mix, Float, Vec2, Vec3, Vec4 } from '../../src/node'
import { inferAndCode } from '../../test-utils'

describe('Type Inference', () => {
        describe('Function return types', () => {
                it('preserves input type', () => {
                        const x: Float = sin(float(1.57))
                        const y: Vec3 = normalize(vec3(1, 2, 3))
                        expect(inferAndCode(x).type).toBe('float')
                        expect(inferAndCode(y).type).toBe('vec3')
                })

                it('returns scalar', () => {
                        const x: Float = dot(vec3(1, 0, 0), vec3(0, 1, 0))
                        expect(inferAndCode(x).type).toBe('float')
                })

                it('highest type promotion', () => {
                        const x: Vec3 = mix(vec3(1, 0, 0), vec3(0, 1, 0), float(0.5))
                        expect(inferAndCode(x).type).toBe('vec3')
                })
        })

        describe('Complex expressions', () => {
                it('nested operations', () => {
                        const x: Vec3 = mix(vec3(1, 0, 0), vec3(0, 1, 0), float(0.5)).add(vec3(0, 0, 1))
                        const y: Float = sin(vec2(1, 2).x).mul(cos(vec2(1, 2).y))
                        expect(inferAndCode(x).type).toBe('vec3')
                        expect(inferAndCode(y).type).toBe('float')
                })
        })

        describe('Swizzle inference', () => {
                it('component count', () => {
                        const x: Vec2 = vec3(1, 2, 3).xy
                        const y: Vec4 = vec2(1, 2).xxxx
                        const z: Float = vec3(1, 2, 3).z
                        expect(inferAndCode(x).type).toBe('vec2')
                        expect(inferAndCode(y).type).toBe('vec4')
                        expect(inferAndCode(z).type).toBe('float')
                })
        })
})
