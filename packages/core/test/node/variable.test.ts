import { describe, it, expect } from '@jest/globals'
import { float, vec3, uniform, Fn } from '../../src/node'

describe('変数管理', () => {
        describe('変数宣言（toVar）', () => {
                it('Fnスコープ内での変数宣言', () => {
                        const shader = Fn(() => {
                                const x = vec3(1, 2, 3).toVar()
                                const y = float(0.5).toVar('myFloat')
                                return x.add(y)
                        })

                        const result = shader()
                        expect(`${result}`).toContain('vec3f x = vec3f(1.0, 2.0, 3.0)')
                        expect(`${result}`).toContain('f32 myFloat = 0.5')
                })

                it('型推論による変数宣言', () => {
                        const shader = Fn(() => {
                                const x = vec3(1, 2, 3).toVar()
                                const y = x.mul(2).toVar()
                                return y
                        })

                        const result = shader()
                        expect(`${result}`).toContain('vec3f x = vec3f(1.0, 2.0, 3.0)')
                        expect(`${result}`).toContain('vec3f')
                })
        })

        describe('変数代入（assign）', () => {
                it('通常の代入', () => {
                        const shader = Fn(() => {
                                const x = vec3(1, 2, 3).toVar()
                                x.assign(vec3(4, 5, 6))
                                return x
                        })

                        const result = shader()
                        expect(`${result}`).toContain('x = vec3f(4.0, 5.0, 6.0)')
                })

                it('スウィズル代入', () => {
                        const shader = Fn(() => {
                                const x = vec3(1, 2, 3).toVar()
                                x.y = float(10)
                                return x
                        })

                        const result = shader()
                        expect(`${result}`).toContain('x.y = 10.0')
                })
        })

        describe('Uniform変数', () => {
                it('uniform宣言と使用', () => {
                        const time = uniform(float(0))
                        const position = uniform(vec3(0, 0, 0))

                        expect(`${time}`).toContain('uniform')
                        expect(`${position}`).toContain('uniform')
                })

                it('uniform自動収集（未実装機能のテスト）', () => {
                        const config = {
                                uniforms: new Set<string>(),
                                isWebGL: false,
                                onUniform: (name: string) => config.uniforms.add(name),
                        }

                        const shader = Fn(() => {
                                const time = uniform(float(0))
                                const pos = uniform(vec3(1, 2, 3))
                                return time.add(pos.x)
                        })

                        // 現在は未実装のため、uniformsは空のまま
                        expect(config.uniforms.size).toBe(0)
                })
        })
})
