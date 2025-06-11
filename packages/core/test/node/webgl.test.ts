import { describe, expect, it } from '@jest/globals'
import { float, glsl, vec2, vec3 } from '../../src/index'

describe('GLSL変換テスト', () => {
        it('基本ノードのGLSL変換', () => {
                const x = float(1.5)
                expect(glsl(x)).toBe('1.5')
        })

        it('ベクトルノードのGLSL変換', () => {
                const xy = vec2(1, 2)
                expect(glsl(xy)).toBe('vec2(1.0, 2.0)')
        })

        it('算術演算のGLSL変換', () => {
                const a = float(2)
                const b = float(3)
                const add = a.add(b)
                expect(glsl(add)).toBe('(2.0 + 3.0)')
        })

        it('複合式のGLSL変換', () => {
                const a = float(1)
                const b = float(2)
                const c = float(3)
                const result = a.add(b).mul(c)
                expect(glsl(result)).toBe('((1.0 + 2.0) * 3.0)')
        })

        it('スウィズル操作のGLSL変換', () => {
                const vec = vec3(1, 2, 3)
                const xy = vec.xy
                expect(glsl(xy)).toBe('vec3(1.0, 2.0, 3.0).xy')
        })

        it('比較演算のGLSL変換', () => {
                const a = float(5)
                const b = float(10)
                const comparison = a.lessThan(b)
                expect(glsl(comparison)).toBe('(5.0 < 10.0)')
        })

        it('GLSL構文の妥当性', () => {
                const expression = float(1).add(float(2)).mul(float(3))
                expect(glsl(expression)).toMatch(
                        /^\(\([\d.]+\s*\+\s*[\d.]+\)\s*\*\s*[\d.]+\)$/
                )
        })

        it('ネストした演算のGLSL変換', () => {
                const a = float(1)
                const b = float(2)
                const c = float(3)
                const d = float(4)
                const nested = a.add(b.mul(c)).div(d)
                expect(glsl(nested)).toBe('((1.0 + (2.0 * 3.0)) / 4.0)')
        })
})
