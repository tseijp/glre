import { describe, expect, it } from '@jest/globals'
import { vec3, vec4 } from '../../index'

describe('スウィズル操作テスト', () => {
        it('ベクトルコンポーネントアクセス', () => {
                const vec = vec3(1, 2, 3)

                const x = vec.x
                expect(x.type).toBe('float')
                expect(x.source).toBe(vec)
                expect(x.component).toBe('x')

                const y = vec.y
                expect(y.type).toBe('float')
                expect(y.component).toBe('y')

                const z = vec.z
                expect(z.type).toBe('float')
                expect(z.component).toBe('z')
        })

        it('スウィズル操作の型確認', () => {
                const vec4Node = vec4(1, 2, 3, 4)

                const xy = vec4Node.xy
                expect(xy.type).toBe('vec2')
                expect(xy.swizzle).toBe('xy')

                const xyz = vec4Node.xyz
                expect(xyz.type).toBe('vec3')
                expect(xyz.swizzle).toBe('xyz')

                const rgba = vec4Node.rgba
                expect(rgba.type).toBe('vec4')
                expect(rgba.swizzle).toBe('rgba')
        })

        it('複雑なスウィズル操作', () => {
                const vec = vec3(1, 2, 3)

                const yx = vec.yx
                expect(yx.type).toBe('vec2')
                expect(yx.swizzle).toBe('yx')

                const zxy = vec.zxy
                expect(zxy.type).toBe('vec3')
                expect(zxy.swizzle).toBe('zxy')
        })

        it('色成分でのスウィズル', () => {
                const vec = vec3(1, 2, 3)

                const r = vec.r
                expect(r.type).toBe('float')
                expect(r.component).toBe('r')

                const gb = vec.gb
                expect(gb.type).toBe('vec2')
                expect(gb.swizzle).toBe('gb')
        })

        it('スウィズル後のノード生成', () => {
                const original = vec3(1, 2, 3)
                const swizzled = original.xy

                expect(swizzled.source).toBe(original)
                expect(swizzled.type).toBe('vec2')
                expect(swizzled.id).not.toBe(original.id)
        })
})
