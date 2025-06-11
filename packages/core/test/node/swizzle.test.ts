import { describe, expect, it } from '@jest/globals'
import { vec3, vec4 } from '../../src/index'

describe('スウィズル操作テスト', () => {
        it('ベクトルコンポーネントアクセス', () => {
                const xyz = vec3(1, 2, 3)
                const x = xyz.x
                expect(x.type).toBe('float')
                expect(x.source).toBe(xyz)
                expect(x.component).toBe('x')

                const y = xyz.y
                expect(y.type).toBe('float')
                expect(y.component).toBe('y')

                const z = xyz.z
                expect(z.type).toBe('float')
                expect(z.component).toBe('z')
        })

        it('スウィズル操作の型確認', () => {
                const xyzw = vec4(1, 2, 3, 4)
                const xy = xyz.xy
                expect(xy.type).toBe('vec2')
                expect(xy.swizzle).toBe('xy')
                const xyz = xyzw.xyz
                expect(xyz.type).toBe('vec3')
                expect(xyz.swizzle).toBe('xyz')
                const rgba = xyzw.rgba
                expect(rgba.type).toBe('vec4')
                expect(rgba.swizzle).toBe('rgba')
        })

        it('複雑なスウィズル操作', () => {
                const xyz = vec3(1, 2, 3)
                const yx = xyz.yx
                expect(yx.type).toBe('vec2')
                expect(yx.swizzle).toBe('yx')
                const zxy = xyz.zxy
                expect(zxy.type).toBe('vec3')
                expect(zxy.swizzle).toBe('zxy')
        })

        it('色成分でのスウィズル', () => {
                const xyz = vec3(1, 2, 3)
                const r = xyz.r
                expect(r.type).toBe('float')
                expect(r.component).toBe('r')
                const gb = xyz.gb
                expect(gb.type).toBe('vec2')
                expect(gb.swizzle).toBe('gb')
        })

        it('スウィズル後のノード生成', () => {
                const xyz = vec3(1, 2, 3)
                const xy = xyz.xy
                expect(xy.source).toBe(xyz)
                expect(xy.type).toBe('vec2')
                expect(xy.id).not.toBe(xyz.id)
        })
})
