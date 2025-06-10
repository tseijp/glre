import { describe, expect, it } from '@jest/globals'
import { float, glsl, vec2, vec3 } from '../../index'

describe('GLSL変換テスト', () => {
        it('基本ノードのGLSL変換', () => {
                const floatNode = float(1.5)
                const glslCode = glsl(floatNode)

                expect(glslCode).toBe('1.5')
        })

        it('ベクトルノードのGLSL変換', () => {
                const vec2Node = vec2(1, 2)
                const glslCode = glsl(vec2Node)

                expect(glslCode).toBe('vec2(1.0, 2.0)')
        })

        it('算術演算のGLSL変換', () => {
                const a = float(2)
                const b = float(3)
                const add = a.add(b)
                const glslCode = glsl(add)

                expect(glslCode).toBe('(2.0 + 3.0)')
        })

        it('複合式のGLSL変換', () => {
                const a = float(1)
                const b = float(2)
                const c = float(3)
                const result = a.add(b).mul(c)
                const glslCode = glsl(result)

                expect(glslCode).toBe('((1.0 + 2.0) * 3.0)')
        })

        it('スウィズル操作のGLSL変換', () => {
                const vec = vec3(1, 2, 3)
                const xy = vec.xy
                const glslCode = glsl(xy)

                expect(glslCode).toBe('vec3(1.0, 2.0, 3.0).xy')
        })

        it('比較演算のGLSL変換', () => {
                const a = float(5)
                const b = float(10)
                const comparison = a.lessThan(b)
                const glslCode = glsl(comparison)

                expect(glslCode).toBe('(5.0 < 10.0)')
        })

        it('GLSL構文の妥当性', () => {
                const expression = float(1).add(float(2)).mul(float(3))
                const glslCode = glsl(expression)

                expect(glslCode).toMatch(
                        /^\(\([\d.]+\s*\+\s*[\d.]+\)\s*\*\s*[\d.]+\)$/
                )
        })

        it('ネストした演算のGLSL変換', () => {
                const a = float(1)
                const b = float(2)
                const c = float(3)
                const d = float(4)
                const nested = a.add(b.mul(c)).div(d)
                const glslCode = glsl(nested)

                expect(glslCode).toBe('((1.0 + (2.0 * 3.0)) / 4.0)')
        })
})
