import { describe, expect, it } from '@jest/globals'
import { float, vec2, vec3, color } from '../../src/index'

describe('型変換テスト', () => {
        it('JavaScript値からノードへの変換', () => {
                const f = float(1.5)
                expect(f.value).toBe(1.5)
                expect(f.type).toBe('float')

                const v2 = vec2(1, 2)
                expect(v2.value).toEqual([1, 2])
                expect(v2.type).toBe('vec2')

                const v3 = vec3(1, 2, 3)
                expect(v3.value).toEqual([1, 2, 3])
                expect(v3.type).toBe('vec3')

                const c = color(0xff0000)
                expect(c.value).toBe(0xff0000)
                expect(c.type).toBe('color')
        })

        it('配列からベクトルへの変換', () => {
                const v2 = vec2([1, 2])
                expect(v2.value).toEqual([1, 2])
                expect(v2.type).toBe('vec2')

                const v3 = vec3([1, 2, 3])
                expect(v3.value).toEqual([1, 2, 3])
                expect(v3.type).toBe('vec3')
        })

        it('型変換時の値の保持', () => {
                const originalValue = 3.14
                const node = float(originalValue)
                expect(node.value).toBe(originalValue)

                const vectorValue = [1, 2, 3]
                const vecNode = vec3(vectorValue)
                expect(vecNode.value).toEqual(vectorValue)
        })

        it('色の16進数表記変換', () => {
                const redColor = color(0xff0000)
                expect(redColor.value).toBe(0xff0000)
                expect(redColor.type).toBe('color')

                const greenColor = color(0x00ff00)
                expect(greenColor.value).toBe(0x00ff00)
                expect(greenColor.type).toBe('color')
        })
})
