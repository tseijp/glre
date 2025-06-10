import { describe, expect, it } from '@jest/globals'
import { float, vec2, vec3 } from '../../index'

describe('ノード基本機能', () => {
        it('float ノードの値が正しく設定されること', () => {
                const node = float(1.5)
                expect(node.value).toBe(1.5)
                expect(node.type).toBe('float')
        })

        it('vec2 ノードの値が正しく設定されること', () => {
                const node = vec2(1, 2)
                expect(node.value).toEqual([1, 2])
                expect(node.type).toBe('vec2')
        })

        it('vec3 ノードの値が正しく設定されること', () => {
                const node = vec3(1, 2, 3)
                expect(node.value).toEqual([1, 2, 3])
                expect(node.type).toBe('vec3')
        })

        it('プロパティアクセスで新しいノードが生成されること', () => {
                const vec = vec3(1, 2, 3)
                const x = vec.x
                expect(x.type).toBe('float')
                expect(x.property).toBe('x')
        })

        it('ノードIDが一意に生成されること', () => {
                const node1 = float(1)
                const node2 = float(1)
                expect(node1.id).not.toBe(node2.id)
        })
})
