import { describe, expect, it } from '@jest/globals'
import { float, vec2 } from '../../src/index'

describe('演算子テスト', () => {
        it('算術演算子が正しく動作すること', () => {
                const a = float(2)
                const b = float(3)

                const add = a.add(b)
                expect(add.type).toBe('float')
                expect(add.operation).toBe('add')
                expect(add.operands).toEqual([a, b])

                const sub = a.sub(b)
                expect(sub.type).toBe('float')
                expect(sub.operation).toBe('sub')

                const mul = a.mul(b)
                expect(mul.type).toBe('float')
                expect(mul.operation).toBe('mul')

                const div = a.div(b)
                expect(div.type).toBe('float')
                expect(div.operation).toBe('div')
        })

        it('比較演算子が正しく動作すること', () => {
                const a = float(2)
                const b = float(3)

                const gt = a.greaterThan(b)
                expect(gt.type).toBe('bool')
                expect(gt.operation).toBe('greaterThan')

                const lt = a.lessThan(b)
                expect(lt.type).toBe('bool')
                expect(lt.operation).toBe('lessThan')

                const eq = a.equal(b)
                expect(eq.type).toBe('bool')
                expect(eq.operation).toBe('equal')
        })

        it('ベクトル演算が正しく動作すること', () => {
                const v1 = vec2(1, 2)
                const v2 = vec2(3, 4)

                const add = v1.add(v2)
                expect(add.type).toBe('vec2')
                expect(add.operation).toBe('add')
                expect(add.operands).toEqual([v1, v2])
        })

        it('メソッドチェーニングが正しく動作すること', () => {
                const a = float(1)
                const b = float(2)
                const c = float(3)

                const result = a.add(b).mul(c)
                expect(result.type).toBe('float')
                expect(result.operation).toBe('mul')
        })
})
