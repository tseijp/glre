import { describe, it, expect } from '@jest/globals'
import { float, vec3, mat3, sin, cos, Fn } from '../../src/node'
import { inferAndCode } from '../../test-utils'

describe('Function Composition', () => {
        describe('TSL function patterns', () => {
                it('rotation matrix function', () => {
                        const rotate = Fn(([angle]) => {
                                const s = sin(angle)
                                const c = cos(angle)
                                return mat3(c, float(0), s, float(0), float(1), float(0), s.negate(), float(0), c)
                        })
                        rotate.setLayout({
                                name: 'rotate',
                                type: 'mat3',
                                inputs: [{ name: 'angle', type: 'float' }],
                        })
                        const result = rotate(float(1.57))
                        expect(inferAndCode(result).type).toBe('mat3')
                        expect(inferAndCode(result).wgsl).toBe('rotate(f32(1.57))')
                })

                it('interpolation function', () => {
                        const interpolate = Fn(([a, b, t]) => {
                                return a.mul(float(1).sub(t)).add(b.mul(t))
                        })
                        interpolate.setLayout({
                                name: 'interpolate',
                                type: 'vec3',
                                inputs: [
                                        { name: 'a', type: 'vec3' },
                                        { name: 'b', type: 'vec3' },
                                        { name: 't', type: 'float' },
                                ],
                        })
                        const result = interpolate(vec3(1, 0, 0), vec3(0, 1, 0), float(0.5))
                        expect(inferAndCode(result).type).toBe('vec3')
                })
        })

        describe('Function nesting', () => {
                it('function calling function', () => {
                        const square = Fn(([x]) => x.mul(x))
                        square.setLayout({
                                name: 'square',
                                type: 'float',
                                inputs: [{ name: 'x', type: 'float' }],
                        })
                        const distance = Fn(([a, b]) => {
                                const dx = a.x.sub(b.x)
                                const dy = a.y.sub(b.y)
                                return square(dx).add(square(dy))
                        })
                        distance.setLayout({
                                name: 'distance',
                                type: 'float',
                                inputs: [
                                        { name: 'a', type: 'vec3' },
                                        { name: 'b', type: 'vec3' },
                                ],
                        })
                        const result = distance(vec3(1, 2, 3), vec3(4, 5, 6))
                        expect(inferAndCode(result).type).toBe('float')
                })
        })

        describe('Layout handling', () => {
                it('auto type inference', () => {
                        const add = Fn(([a, b]) => a.add(b))
                        add.setLayout({
                                name: 'add',
                                type: 'auto',
                                inputs: [
                                        { name: 'a', type: 'float' },
                                        { name: 'b', type: 'float' },
                                ],
                        })
                        const result = add(float(1), float(2))
                        expect(inferAndCode(result).type).toBe('float')
                })
        })
})
