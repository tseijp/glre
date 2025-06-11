import { describe, expect, it } from '@jest/globals'
import { float, vec2, vec3, wgsl } from '../../src/index'

describe('WGSL変換テスト', () => {
        it('基本ノードのWGSL変換', () => {
                const x = float(1.5)
                expect(wgsl(x)).toBe('1.5')
        })

        it('ベクトルノードのWGSL変換', () => {
                const xy = vec2(1, 2)
                expect(wgsl(xy)).toBe('vec2<f32>(1.0, 2.0)')
        })

        it('算術演算のWGSL変換', () => {
                const a = float(2)
                const b = float(3)
                const add = a.add(b)
                expect(wgsl(add)).toBe('(2.0 + 3.0)')
        })

        it('複合式のWGSL変換', () => {
                const a = float(1)
                const b = float(2)
                const c = float(3)
                const result = a.add(b).mul(c)
                expect(wgsl(result)).toBe('((1.0 + 2.0) * 3.0)')
        })

        it('スウィズル操作のWGSL変換', () => {
                const vec = vec3(1, 2, 3)
                const xy = vec.xy
                expect(wgsl(xy)).toBe('vec3<f32>(1.0, 2.0, 3.0).xy')
        })

        it('比較演算のWGSL変換', () => {
                const a = float(5)
                const b = float(10)
                const comparison = a.lessThan(b)
                expect(wgsl(comparison)).toBe('(5.0 < 10.0)')
        })

        it('WGSL構文の妥当性', () => {
                const expression = float(1).add(float(2)).mul(float(3))
                expect(wgsl(expression)).toMatch(
                        /^\(\([\d.]+\s*\+\s*[\d.]+\)\s*\*\s*[\d.]+\)$/
                )
        })

        it('型指定子の確認', () => {
                const vec3Node = vec3(1, 2, 3)
                expect(wgsl(vec3Node)).toContain('vec3<f32>')
        })

        it('ネストした演算のWGSL変換', () => {
                const a = float(1)
                const b = float(2)
                const c = float(3)
                const d = float(4)
                const nested = a.add(b.mul(c)).div(d)
                expect(wgsl(nested)).toBe('((1.0 + (2.0 * 3.0)) / 4.0)')
        })
})
