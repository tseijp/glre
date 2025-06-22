import { describe, it, expect } from '@jest/globals'
import { float, int, vec2, vec3, vec4, mat4, normalize, sin, cross, dot, mix } from '../../src/node'
import { node } from '../../src/node'

const color = (hex: number) => {
        const r = ((hex >> 16) & 0xff) / 255
        const g = ((hex >> 8) & 0xff) / 255
        const b = (hex & 0xff) / 255
        return vec3(r, g, b)
}

describe('Basic types and operations', () => {
        describe('Type generation and code conversion', () => {
                it('WGSL conversion for scalar types', () => {
                        const x = float(1.5)
                        const y = int(2)

                        expect(`${x}`).toBe('1.5')
                        expect(`${y}`).toBe('2')
                })

                it('WGSL conversion for vector types', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec4(0.5)

                        expect(`${x}`).toBe('vec3f(1.0, 2.0, 3.0)')
                        expect(`${y}`).toBe('vec4f(0.5)')
                })

                it('WGSL conversion for matrix types', () => {
                        const x = mat4()

                        expect(`${x}`).toBe(
                                'mat4x4f(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0)'
                        )
                })

                it('WGSL conversion for color types', () => {
                        const x = color(0xff0000)

                        expect(`${x}`).toBe('vec3f(1.0, 0.0, 0.0)')
                })
        })

        describe('Operators', () => {
                it('Arithmetic operator chaining', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const z = x.add(y).mul(2).sub(vec3(1))

                        expect(`${z}`).toBe(
                                '((vec3f(1.0, 2.0, 3.0) + vec3f(4.0, 5.0, 6.0)) * 2.0 - vec3f(1.0, 1.0, 1.0))'
                        )
                })

                it('Comparison operators', () => {
                        const x = float(1)
                        const y = float(2)
                        const z = x.lessThan(y)

                        expect(`${z}`).toBe('(1.0 < 2.0)')
                })

                it('Logical operator combinations', () => {
                        const x = float(1).equal(float(1))
                        const y = float(2).greaterThan(float(1))
                        const z = x.and(y)

                        expect(`${z}`).toBe('((1.0 == 1.0) && (2.0 > 1.0))')
                })
        })

        describe('Swizzling', () => {
                it('Single component access', () => {
                        const x = vec3(1, 2, 3)
                        const y = x.y

                        expect(`${y}`).toBe('vec3f(1.0, 2.0, 3.0).y')
                })

                it('Multiple component access', () => {
                        const x = vec4(1, 2, 3, 4)
                        const y = x.xyz
                        const z = x.rg

                        expect(`${y}`).toBe('vec4f(1.0, 2.0, 3.0, 4.0).xyz')
                        expect(`${z}`).toBe('vec4f(1.0, 2.0, 3.0, 4.0).rg')
                })

                it('Swizzle operations', () => {
                        const x = vec3(1, 2, 3)
                        const y = x.xy.add(vec2(4, 5))

                        expect(`${y}`).toBe('(vec3f(1.0, 2.0, 3.0).xy + vec2f(4.0, 5.0))')
                })
        })

        describe('Mathematical functions', () => {
                it('Basic mathematical functions', () => {
                        const x = vec3(1, 2, 3)
                        const y = normalize(x)
                        const z = sin(float(0.5))

                        expect(`${y}`).toBe('normalize(vec3f(1.0, 2.0, 3.0))')
                        expect(`${z}`).toBe('sin(0.5)')
                })

                it('Vector functions', () => {
                        const x = vec3(1, 0, 0)
                        const y = vec3(0, 1, 0)
                        const z = cross(x, y)
                        const w = dot(x, y)

                        expect(`${z}`).toBe('cross(vec3f(1.0, 0.0, 0.0), vec3f(0.0, 1.0, 0.0))')
                        expect(`${w}`).toBe('dot(vec3f(1.0, 0.0, 0.0), vec3f(0.0, 1.0, 0.0))')
                })

                it('Interpolation functions', () => {
                        const x = float(0)
                        const y = float(1)
                        const t = float(0.5)
                        const z = mix(x, y, t)

                        expect(`${z}`).toBe('mix(0.0, 1.0, 0.5)')
                })
        })
})
