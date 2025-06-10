import { describe, expect, it } from '@jest/globals'
import { float, vec2, vec3, wgsl } from '../../src/node/index'

describe('WGSL変換テスト', () => {
        it('基本ノードのWGSL変換', () => {
                const floatNode = float(1.5)
                const wgslCode = wgsl(floatNode)

                expect(wgslCode).toBe('1.5')
        })

        it('ベクトルノードのWGSL変換', () => {
                const vec2Node = vec2(1, 2)
                const wgslCode = wgsl(vec2Node)

                expect(wgslCode).toBe('vec2<f32>(1.0, 2.0)')
        })

        it('算術演算のWGSL変換', () => {
                const a = float(2)
                const b = float(3)
                const add = a.add(b)
                const wgslCode = wgsl(add)

                expect(wgslCode).toBe('(2.0 + 3.0)')
        })

        it('複合式のWGSL変換', () => {
                const a = float(1)
                const b = float(2)
                const c = float(3)
                const result = a.add(b).mul(c)
                const wgslCode = wgsl(result)

                expect(wgslCode).toBe('((1.0 + 2.0) * 3.0)')
        })

        it('スウィズル操作のWGSL変換', () => {
                const vec = vec3(1, 2, 3)
                const xy = vec.xy
                const wgslCode = wgsl(xy)

                expect(wgslCode).toBe('vec3<f32>(1.0, 2.0, 3.0).xy')
        })

        it('比較演算のWGSL変換', () => {
                const a = float(5)
                const b = float(10)
                const comparison = a.lessThan(b)
                const wgslCode = wgsl(comparison)

                expect(wgslCode).toBe('(5.0 < 10.0)')
        })

        it('WGSL構文の妥当性', () => {
                const expression = float(1).add(float(2)).mul(float(3))
                const wgslCode = wgsl(expression)

                expect(wgslCode).toMatch(
                        /^\(\([\d.]+\s*\+\s*[\d.]+\)\s*\*\s*[\d.]+\)$/
                )
        })

        it('型指定子の確認', () => {
                const vec3Node = vec3(1, 2, 3)
                const wgslCode = wgsl(vec3Node)

                expect(wgslCode).toContain('vec3<f32>')
        })

        it('ネストした演算のWGSL変換', () => {
                const a = float(1)
                const b = float(2)
                const c = float(3)
                const d = float(4)
                const nested = a.add(b.mul(c)).div(d)
                const wgslCode = wgsl(nested)

                expect(wgslCode).toBe('((1.0 + (2.0 * 3.0)) / 4.0)')
        })
})
