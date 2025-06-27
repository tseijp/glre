import { describe, it, expect } from '@jest/globals'
import { float, vec3, mat3, sin, cos, Fn } from '../../src/node'
import { inferAndCode } from './utils'

describe('Function Composition', () => {
        describe('TSL compatible function patterns', () => {
                it('rotate function like TSL', () => {
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
                        const { type, wgsl } = inferAndCode(result)
                        expect(type).toBe('mat3')
                        expect(wgsl).toBe('rotate(f32(1.57))')
                })

                it('mix function composition', () => {
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
                        const { type, wgsl } = inferAndCode(result)
                        expect(type).toBe('vec3')
                        expect(wgsl).toBe('interpolate(vec3f(1.0, 0.0, 0.0),vec3f(0.0, 1.0, 0.0),f32(0.5))')
                })
        })

        describe('Function nesting', () => {
                it('function calling another function', () => {
                        const square = Fn(([x]) => {
                                return x.mul(x)
                        })
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
                        const { type, wgsl } = inferAndCode(result)
                        expect(type).toBe('float')
                        expect(wgsl).toBe('distance(vec3f(1.0, 2.0, 3.0),vec3f(4.0, 5.0, 6.0))')
                })

                it('complex function composition', () => {
                        const transform = Fn(([pos, scale, rotation]) => {
                                const s = sin(rotation)
                                const c = cos(rotation)
                                const rotMat = mat3(
                                        c,
                                        s.negate(),
                                        float(0),
                                        s,
                                        c,
                                        float(0),
                                        float(0),
                                        float(0),
                                        float(1)
                                )
                                return rotMat.mul(pos.mul(scale))
                        })
                        transform.setLayout({
                                name: 'transform',
                                type: 'vec3',
                                inputs: [
                                        { name: 'pos', type: 'vec3' },
                                        { name: 'scale', type: 'float' },
                                        { name: 'rotation', type: 'float' },
                                ],
                        })
                        const result = transform(vec3(1, 1, 0), float(2), float(0.5))
                        const { type, wgsl } = inferAndCode(result)
                        expect(type).toBe('vec3')
                        expect(wgsl).toBe('transform(vec3f(1.0, 1.0, 0.0),f32(2.0),f32(0.5))')
                })
        })

        describe('Layout definition and types', () => {
                it('function with explicit layout', () => {
                        const normalize2d = Fn(([v]) => {
                                const len = v.x.mul(v.x).add(v.y.mul(v.y))
                                return v.div(len)
                        })
                        normalize2d.setLayout({
                                name: 'normalize2d',
                                type: 'vec3',
                                inputs: [{ name: 'v', type: 'vec3' }],
                        })
                        const result = normalize2d(vec3(3, 4, 0))
                        const { type, wgsl } = inferAndCode(result)
                        expect(type).toBe('vec3')
                        expect(wgsl).toBe('normalize2d(vec3f(3.0, 4.0, 0.0))')
                })

                it('function without explicit return type', () => {
                        const add = Fn(([a, b]) => {
                                return a.add(b)
                        })
                        add.setLayout({
                                name: 'add',
                                type: 'auto',
                                inputs: [
                                        { name: 'a', type: 'float' },
                                        { name: 'b', type: 'float' },
                                ],
                        })
                        const result = add(float(1), float(2))
                        const { type, wgsl } = inferAndCode(result)
                        expect(type).toBe('float') // @TODO FIX
                        expect(wgsl).toBe('add(f32(1.0),f32(2.0))')
                })

                it('function with multiple return types', () => {
                        const swap = Fn(([v]) => {
                                return vec3(v.y, v.x, v.z)
                        })
                        swap.setLayout({
                                name: 'swap',
                                type: 'vec3',
                                inputs: [{ name: 'v', type: 'vec3' }],
                        })
                        const result = swap(vec3(1, 2, 3))
                        const { type, wgsl } = inferAndCode(result)
                        expect(type).toBe('vec3')
                        expect(wgsl).toBe('swap(vec3f(1.0, 2.0, 3.0))')
                })
        })
})
