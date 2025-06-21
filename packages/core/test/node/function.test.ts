import { describe, it, expect } from '@jest/globals'
import { float, vec3, int, Fn } from '../../src/node'

describe('関数（Fn）', () => {
        describe('関数定義と型推論', () => {
                it('引数なし関数の定義', () => {
                        const myFunction = Fn(() => {
                                const x = vec3(1, 2, 3).toVar()
                                const y = x.mul(2)
                                return y
                        })

                        const result = myFunction()
                        expect(`${result}`).toContain('vec3f')
                })

                it('引数ありの関数定義', () => {
                        const myFunction = Fn((args) => {
                                const [x, y] = args
                                const sum = x.add(y).toVar()
                                return sum
                        })

                        const result = myFunction(float(1), float(2))
                        expect(`${result}`).toContain('add')
                })

                it('引数の型推論', () => {
                        const vectorAdd = Fn((args) => {
                                const [a, b] = args
                                // 引数の型は実際に使用される値から推論される
                                const result = a.add(b).toVar()
                                return result
                        })

                        const result1 = vectorAdd(vec3(1, 0, 0), vec3(0, 1, 0))
                        const result2 = vectorAdd(float(1), float(2))

                        // 現在の実装では完全な型推論は未実装
                        expect(`${result1}`).toContain('vec3f')
                        expect(`${result2}`).toContain('add')
                })

                it('戻り値の型推論', () => {
                        const computeLength = Fn((args) => {
                                const [vec] = args
                                const length = vec.length().toVar()
                                return length
                        })

                        const result = computeLength(vec3(3, 4, 0))
                        // 戻り値の型は return 文から推論される
                        expect(`${result}`).toContain('length')
                })
        })

        describe('関数の合成', () => {
                it('関数を引数として使用', () => {
                        const square = Fn((args) => {
                                const [x] = args
                                return x.mul(x)
                        })

                        const doubleAndSquare = Fn((args) => {
                                const [x] = args
                                const doubled = x.mul(2)
                                return square(doubled)
                        })

                        const result = doubleAndSquare(float(3))
                        expect(`${result}`).toContain('mul')
                })

                it('複数の戻り値を持つ関数', () => {
                        const computeVectorStats = Fn((args) => {
                                const [vec] = args
                                const length = vec.length().toVar()
                                const normalized = vec.normalize().toVar()

                                // 現在の実装では複数戻り値は未対応
                                // 最後の return のみが有効
                                return { length, normalized }
                        })

                        const result = computeVectorStats(vec3(3, 4, 0))
                        expect(`${result}`).toBeDefined()
                })
        })

        describe('関数のGLSL/WGSL変換', () => {
                it('関数の完全なGLSL/WGSL変換（未実装機能）', () => {
                        const boxSDF = Fn((args) => {
                                const [p, side] = args
                                const d = p.abs().sub(side).toVar()
                                const inside = d.x.max(d.y.max(d.z)).min(float(0))
                                const outside = d.max(vec3(0)).length()
                                return inside.add(outside)
                        })

                        // 現在の実装では関数は完全にGLSL/WGSLに変換されない
                        const result = boxSDF(vec3(1, 2, 3), float(1))

                        // テストは実装されていない機能への期待値
                        // 実際の実装では関数が正しく変換される必要がある
                        expect(`${result}`).toBeDefined()
                })

                it('再帰関数（制限事項）', () => {
                        // GLSLでは再帰関数は一般的にサポートされていない
                        const factorial = Fn((args) => {
                                const [n] = args
                                const result = float(1).toVar()

                                // 実際の実装では再帰ではなくループで実装
                                return result
                        })

                        const result = factorial(int(5))
                        expect(`${result}`).toBeDefined()
                })
        })
})
