import { describe, expect, it } from '@jest/globals'
import { float, vec2, vec3 } from '../../src/index'

describe('ノード基本機能', () => {
        it('float ノードの値が正しく設定されること', () => {
                const x = float(1.5)
                expect(x.value).toBe(1.5)
                expect(x.type).toBe('float')
        })

        it('vec2 ノードの値が正しく設定されること', () => {
                const x = vec2(1, 2)
                expect(x.value).toEqual([1, 2])
                expect(x.type).toBe('vec2')
        })

        it('vec3 ノードの値が正しく設定されること', () => {
                const xyz = vec3(1, 2, 3)
                expect(xyz.value).toEqual([1, 2, 3])
                expect(xyz.type).toBe('vec3')
        })

        it('プロパティアクセスで新しいノードが生成されること', () => {
                const xyz = vec3(1, 2, 3)
                const x = xyz.x
                expect(x.type).toBe('float')
                expect(x.property).toBe('x')
        })

        it('ノードIDが一意に生成されること', () => {
                const x = float(1)
                const y = float(1)
                expect(x.id).not.toBe(y.id)
        })
})
