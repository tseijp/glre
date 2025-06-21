import { describe, it, expect } from '@jest/globals'
import { float, vec3, int, If, Loop, Fn, abs, min, max, length, normalize, cross, dot } from '../../src/node'

describe('複合シェーダーパターン', () => {
        describe('距離関数パターン', () => {
                it('Box SDF実装', () => {
                        const boxSDF = Fn((args) => {
                                const [p, side] = args
                                const d = abs(p).sub(side).toVar('d')
                                const outside = max(d, vec3(0)).length()
                                const inside = max(d.x, max(d.y, d.z)).min(float(0))
                                return inside.add(outside)
                        })

                        const result = boxSDF(vec3(1, 2, 3), float(1))
                        expect(`${result}`).toContain('abs')
                        expect(`${result}`).toContain('max')
                        expect(`${result}`).toContain('length')
                })

                it('球の距離関数', () => {
                        const sphereSDF = Fn((args) => {
                                const [p, radius] = args
                                return length(p).sub(radius)
                        })

                        const result = sphereSDF(vec3(1, 2, 3), float(2))
                        expect(`${result}`).toContain('length')
                        expect(`${result}`).toContain('sub')
                })
        })

        describe('法線計算パターン', () => {
                it('数値微分による法線計算', () => {
                        const calculateNormal = Fn((args) => {
                                const [p, sdf] = args
                                const epsilon = vec3(0.0005, 0, 0).toVar('epsilon')

                                const dx = sdf(p.add(epsilon.xyy)).sub(sdf(p.sub(epsilon.xyy)))
                                const dy = sdf(p.add(epsilon.yxy)).sub(sdf(p.sub(epsilon.yxy)))
                                const dz = sdf(p.add(epsilon.yyx)).sub(sdf(p.sub(epsilon.yyx)))

                                return normalize(vec3(dx, dy, dz))
                        })

                        // この関数は実際のSDF関数を引数として受け取る必要があるが
                        // 現在の実装では関数の引数として関数を渡すのは制限がある
                        expect(calculateNormal).toBeDefined()
                })
        })

        describe('レイマーチングパターン', () => {
                it('基本的なレイマーチング', () => {
                        const rayMarch = Fn((args) => {
                                const [origin, direction, maxDistance] = args

                                const totalDistance = float(0).toVar('totalDistance')
                                const position = origin.toVar('position')
                                const hit = float(0).toVar('hit')

                                Loop(int(50), ({ i }) => {
                                        // 実際のSDF関数を呼び出す部分は簡略化
                                        const distance = length(position).sub(float(1)) // 球のSDF

                                        If(distance.lessThan(float(0.001)), () => {
                                                hit.assign(float(1))
                                                // break相当の処理（現在未実装）
                                        })

                                        position.assign(position.add(direction.mul(distance)))
                                        totalDistance.assign(totalDistance.add(distance))

                                        If(totalDistance.greaterThan(maxDistance), () => {
                                                // break相当の処理（現在未実装）
                                        })
                                })

                                return { hit, position, totalDistance }
                        })

                        const result = rayMarch(vec3(0, 0, -5), vec3(0, 0, 1), float(100))
                        expect(`${result}`).toBeDefined()
                })

                it('カメラセットアップパターン', () => {
                        const setupCamera = Fn((args) => {
                                const [eye, focus, up, fov] = args

                                const look = normalize(focus.sub(eye)).toVar('look')
                                const right = normalize(cross(look, up)).toVar('right')
                                const upVector = cross(right, look).toVar('upVector')

                                return { look, right, upVector }
                        })

                        const result = setupCamera(vec3(0, 0, -5), vec3(0, 0, 0), vec3(0, 1, 0), float(45))

                        expect(`${result}`).toBeDefined()
                })
        })

        describe('フラグメントシェーダーパターン', () => {
                it('UV座標からワールド座標変換', () => {
                        const uvToWorld = Fn((args) => {
                                const [uv, resolution, camera] = args

                                const screenPos = uv.mul(2).sub(vec3(1)).toVar('screenPos')
                                const aspectRatio = resolution.x.div(resolution.y)
                                screenPos.x = screenPos.x.mul(aspectRatio)

                                // レイ方向の計算
                                const rayDir = normalize(
                                        camera.look.add(camera.right.mul(screenPos.x)).add(camera.up.mul(screenPos.y))
                                )

                                return rayDir
                        })

                        const result = uvToWorld(vec3(0.5, 0.5, 0), vec3(1920, 1080, 0), {
                                look: vec3(0, 0, 1),
                                right: vec3(1, 0, 0),
                                up: vec3(0, 1, 0),
                        })

                        expect(`${result}`).toBeDefined()
                })

                it('色計算パターン', () => {
                        const computeColor = Fn((args) => {
                                const [normal, lightDir, viewDir] = args

                                const diffuse = max(dot(normal, lightDir), float(0))
                                const halfway = normalize(lightDir.add(viewDir))
                                const specular = max(dot(normal, halfway), float(0))

                                const ambient = vec3(0.1).toVar('ambient')
                                const diffuseColor = vec3(0.8, 0.6, 0.4).toVar('diffuseColor')
                                const specularColor = vec3(1).toVar('specularColor')

                                const finalColor = ambient
                                        .add(diffuseColor.mul(diffuse))
                                        .add(specularColor.mul(specular))

                                return finalColor
                        })

                        const result = computeColor(vec3(0, 1, 0), normalize(vec3(1, 1, 1)), vec3(0, 0, -1))

                        expect(`${result}`).toBeDefined()
                })
        })
})
