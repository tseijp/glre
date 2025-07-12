# 3D 表現と空間

立体的なビジュアルとカメラ操作を使った 3 次元表現を学びましょう。

## 3D 空間の基本

### 3 次元座標系

GLRE では 3 次元空間を以下のように定義します：

```
       Y↑
       |
       |
       |
       0----→ X
      /
     /
    ↙ Z
```

### 基本的な 3D オブジェクト

```javascript
const gl = createGL({
        count: 36, // キューブの描画には36頂点必要

        vertex: () => {
                const position = attribute('position') // 3D座標
                const viewMatrix = uniform('viewMatrix')
                const projectionMatrix = uniform('projectionMatrix')

                // 3D変換
                const worldPos = position
                const viewPos = viewMatrix.mul(vec4(worldPos, 1.0))
                const clipPos = projectionMatrix.mul(viewPos)

                return clipPos
        },

        fragment: () => {
                const worldPos = varying('worldPos')

                // 座標を色にマッピング
                const color = worldPos.mul(0.5).add(0.5)

                return vec4(color, 1.0)
        },
})

// キューブの頂点データ
const cubeVertices = [
        // 前面
        -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1,
        // 背面
        -1, -1, -1, -1, 1, -1, 1, 1, -1, -1, -1, -1, 1, 1, -1, 1, -1, -1,
        // 上面
        -1, 1, -1, -1, 1, 1, 1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1, -1,
        // 下面
        -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, -1, 1, -1, 1, -1, -1, 1,
        // 右面
        1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1, -1, 1,
        // 左面
        -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, -1, -1, -1, 1, 1, -1, 1, -1,
]

gl.attribute('position', cubeVertices)
```

### カメラとプロジェクション

```javascript
// ビュー行列の計算
const createViewMatrix = (eye, target, up) => {
        const forward = normalize(target.sub(eye))
        const right = normalize(cross(forward, up))
        const realUp = cross(right, forward)

        return mat4([
                right.x,
                realUp.x,
                -forward.x,
                0,
                right.y,
                realUp.y,
                -forward.y,
                0,
                right.z,
                realUp.z,
                -forward.z,
                0,
                -dot(right, eye),
                -dot(realUp, eye),
                dot(forward, eye),
                1,
        ])
}

// プロジェクション行列の計算
const createPerspectiveMatrix = (fov, aspect, near, far) => {
        const f = 1.0 / Math.tan(fov / 2)
        const rangeInv = 1.0 / (near - far)

        return mat4([
                f / aspect,
                0,
                0,
                0,
                0,
                f,
                0,
                0,
                0,
                0,
                (near + far) * rangeInv,
                -1,
                0,
                0,
                near * far * rangeInv * 2,
                0,
        ])
}

gl('loop', () => {
        const time = performance.now() / 1000

        // カメラの位置
        const eye = vec3(Math.cos(time) * 5, 3, Math.sin(time) * 5)
        const target = vec3(0, 0, 0)
        const up = vec3(0, 1, 0)

        // 行列の設定
        const viewMatrix = createViewMatrix(eye, target, up)
        const projectionMatrix = createPerspectiveMatrix(
                Math.PI / 4, // 45度
                gl.size[0] / gl.size[1], // アスペクト比
                0.1, // near
                100.0 // far
        )

        gl.uniform('viewMatrix', viewMatrix)
        gl.uniform('projectionMatrix', projectionMatrix)
})
```

## ライティング

### 基本的な光源

```javascript
const gl = createGL({
        fragment: () => {
                const worldPos = varying('worldPos')
                const worldNormal = varying('worldNormal')

                // ライト設定
                const lightPos = uniform('lightPosition')
                const lightColor = uniform('lightColor')

                // ランバート反射
                const lightDir = normalize(lightPos.sub(worldPos))
                const diffuse = max(0.0, dot(worldNormal, lightDir))

                // 最終色
                const baseColor = vec3(0.8, 0.6, 0.4)
                const finalColor = baseColor.mul(lightColor).mul(diffuse)

                return vec4(finalColor, 1.0)
        },
})

// ライト設定
gl.uniform('lightPosition', [5, 5, 5])
gl.uniform('lightColor', [1, 1, 0.8])
```

### 高度なライティング（Phong 反射）

```javascript
const gl = createGL({
        fragment: () => {
                const worldPos = varying('worldPos')
                const worldNormal = varying('worldNormal')
                const cameraPos = uniform('cameraPosition')

                // ライト設定
                const lightPos = uniform('lightPosition')
                const lightColor = uniform('lightColor')

                // ベクトル計算
                const lightDir = normalize(lightPos.sub(worldPos))
                const viewDir = normalize(cameraPos.sub(worldPos))
                const reflectDir = reflect(lightDir.negate(), worldNormal)

                // 環境光
                const ambient = vec3(0.1, 0.1, 0.15)

                // 拡散反射
                const diffuse = max(0.0, dot(worldNormal, lightDir)).mul(lightColor)

                // 鏡面反射
                const specularPower = 32.0
                const specular = pow(max(0.0, dot(viewDir, reflectDir)), specularPower)
                        .mul(lightColor)
                        .mul(0.5)

                // 最終色
                const baseColor = vec3(0.7, 0.5, 0.3)
                const finalColor = baseColor.mul(ambient.add(diffuse)).add(specular)

                return vec4(finalColor, 1.0)
        },
})
```

### 複数光源

```javascript
const gl = createGL({
        fragment: () => {
                const worldPos = varying('worldPos')
                const worldNormal = varying('worldNormal')

                let totalLighting = vec3(0.1, 0.1, 0.15) // 環境光

                // 3つの光源
                const lightPositions = [uniform('light1Position'), uniform('light2Position'), uniform('light3Position')]
                const lightColors = [uniform('light1Color'), uniform('light2Color'), uniform('light3Color')]

                Loop(3, ({ i }) => {
                        const lightPos = lightPositions[i]
                        const lightColor = lightColors[i]

                        const lightDir = normalize(lightPos.sub(worldPos))
                        const distance = length(lightPos.sub(worldPos))

                        // 距離による減衰
                        const attenuation = oneMinus(min(1.0, distance.div(10.0)))

                        // 拡散反射
                        const diffuse = max(0.0, dot(worldNormal, lightDir)).mul(lightColor).mul(attenuation)

                        totalLighting.assign(totalLighting.add(diffuse))
                })

                const baseColor = vec3(0.8, 0.6, 0.4)
                const finalColor = baseColor.mul(totalLighting)

                return vec4(finalColor, 1.0)
        },
})
```

## 3D オブジェクト生成

### 球体の生成

```javascript
const generateSphere = (radius, segments) => {
        const vertices = []
        const normals = []
        const indices = []

        // 頂点とノーマルの生成
        for (let i = 0; i <= segments; i++) {
                const phi = (i / segments) * Math.PI
                for (let j = 0; j <= segments; j++) {
                        const theta = (j / segments) * 2 * Math.PI

                        const x = radius * Math.sin(phi) * Math.cos(theta)
                        const y = radius * Math.cos(phi)
                        const z = radius * Math.sin(phi) * Math.sin(theta)

                        vertices.push(x, y, z)
                        normals.push(x / radius, y / radius, z / radius)
                }
        }

        // インデックスの生成
        for (let i = 0; i < segments; i++) {
                for (let j = 0; j < segments; j++) {
                        const a = i * (segments + 1) + j
                        const b = a + segments + 1

                        indices.push(a, b, a + 1)
                        indices.push(b, b + 1, a + 1)
                }
        }

        return { vertices, normals, indices }
}

const sphere = generateSphere(1.0, 32)
gl.attribute('position', sphere.vertices)
gl.attribute('normal', sphere.normals)
gl.count = sphere.indices.length
```

### トーラス（ドーナツ型）

```javascript
const generateTorus = (majorRadius, minorRadius, majorSegments, minorSegments) => {
        const vertices = []
        const normals = []

        for (let i = 0; i <= majorSegments; i++) {
                const u = (i / majorSegments) * 2 * Math.PI

                for (let j = 0; j <= minorSegments; j++) {
                        const v = (j / minorSegments) * 2 * Math.PI

                        const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u)
                        const y = minorRadius * Math.sin(v)
                        const z = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u)

                        vertices.push(x, y, z)

                        // ノーマル計算
                        const nx = Math.cos(v) * Math.cos(u)
                        const ny = Math.sin(v)
                        const nz = Math.cos(v) * Math.sin(u)

                        normals.push(nx, ny, nz)
                }
        }

        return { vertices, normals }
}
```

## アニメーション

### 回転アニメーション

```javascript
const gl = createGL({
        vertex: () => {
                const position = attribute('position')
                const time = uniform('iTime')

                // Y軸周りの回転
                const rotationY = time.mul(0.5)
                const cosY = cos(rotationY)
                const sinY = sin(rotationY)

                const rotatedPosition = vec3(
                        position.x.mul(cosY).add(position.z.mul(sinY)),
                        position.y,
                        position.x.mul(sinY).sub(position.z.mul(cosY))
                )

                // ビューとプロジェクション変換
                const mvpMatrix = uniform('mvpMatrix')

                return mvpMatrix.mul(vec4(rotatedPosition, 1.0))
        },

        fragment: () => {
                return vec4(0.8, 0.6, 0.4, 1.0)
        },
})
```

### 変形アニメーション

```javascript
const gl = createGL({
        vertex: () => {
                const position = attribute('position')
                const time = uniform('iTime')

                // 波による変形
                const wave = sin(position.y.mul(3.0).add(time.mul(2.0))).mul(0.3)
                const deformedPosition = position.add(vec3(wave, 0.0, 0.0))

                // 変換行列
                const mvpMatrix = uniform('mvpMatrix')

                return mvpMatrix.mul(vec4(deformedPosition, 1.0))
        },

        fragment: () => {
                const worldPos = varying('worldPos')

                // 変形に応じた色の変化
                const colorShift = sin(worldPos.y.mul(5.0)).mul(0.5).add(0.5)
                const color = vec3(colorShift, 0.6, oneMinus(colorShift))

                return vec4(color, 1.0)
        },
})
```

## 空間効果

### 霧（フォグ）

```javascript
const gl = createGL({
        fragment: () => {
                const worldPos = varying('worldPos')
                const cameraPos = uniform('cameraPosition')

                // オブジェクトの基本色
                const objectColor = vec3(0.8, 0.6, 0.4)

                // 霧の設定
                const fogColor = vec3(0.7, 0.8, 0.9)
                const fogNear = 5.0
                const fogFar = 20.0

                // カメラからの距離
                const distance = length(worldPos.sub(cameraPos))

                // 霧の濃度計算
                const fogFactor = clamp((distance - fogNear) / (fogFar - fogNear), 0.0, 1.0)

                // 霧と色のブレンド
                const finalColor = mix(objectColor, fogColor, fogFactor)

                return vec4(finalColor, 1.0)
        },
})
```

### 被写界深度

```javascript
const gl = createGL({
        fragment: () => {
                const worldPos = varying('worldPos')
                const cameraPos = uniform('cameraPosition')
                const focusDistance = uniform('focusDistance')

                // カメラからの距離
                const distance = length(worldPos.sub(cameraPos))

                // フォーカスからの距離
                const focusBlur = abs(distance - focusDistance) / 3.0
                const blurAmount = clamp(focusBlur, 0.0, 1.0)

                // 基本色
                const sharpColor = vec3(0.8, 0.6, 0.4)

                // ぼかし効果（簡易版）
                const blurredColor = sharpColor.mul(0.7).add(0.3)

                const finalColor = mix(sharpColor, blurredColor, blurAmount)

                return vec4(finalColor, 1.0)
        },
})
```

## インスタンシング

### 大量オブジェクトの描画

```javascript
const instanceCount = 1000

const gl = createGL({
        count: 36 * instanceCount, // キューブ × インスタンス数

        vertex: () => {
                const position = attribute('position')
                const instanceIndex = builtin('instanceIndex')

                // インスタンスごとの位置計算
                const id = float(instanceIndex)
                const angle = id.mul(0.1)
                const radius = id.mul(0.05)

                const instancePos = vec3(cos(angle).mul(radius), sin(id.mul(0.3)).mul(2.0), sin(angle).mul(radius))

                // インスタンス位置を加算
                const worldPos = position.add(instancePos)

                const mvpMatrix = uniform('mvpMatrix')
                return mvpMatrix.mul(vec4(worldPos, 1.0))
        },

        fragment: () => {
                const instanceIndex = builtin('instanceIndex')

                // インスタンスごとの色
                const hue = float(instanceIndex).mul(0.01)
                const color = vec3(
                        sin(hue.mul(6.28)).mul(0.5).add(0.5),
                        sin(hue.mul(6.28).add(2.09)).mul(0.5).add(0.5),
                        sin(hue.mul(6.28).add(4.18)).mul(0.5).add(0.5)
                )

                return vec4(color, 1.0)
        },
})
```

## カメラ制御

### 軌道カメラ

```javascript
class OrbitCamera {
        constructor() {
                this.radius = 5
                this.theta = 0
                this.phi = Math.PI / 4
                this.target = [0, 0, 0]
        }

        update(deltaTheta, deltaPhi, deltaRadius) {
                this.theta += deltaTheta
                this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi + deltaPhi))
                this.radius = Math.max(1, this.radius + deltaRadius)
        }

        getViewMatrix() {
                const x = this.radius * Math.sin(this.phi) * Math.cos(this.theta)
                const y = this.radius * Math.cos(this.phi)
                const z = this.radius * Math.sin(this.phi) * Math.sin(this.theta)

                const eye = [x, y, z]
                const up = [0, 1, 0]

                return createViewMatrix(eye, this.target, up)
        }
}

const camera = new OrbitCamera()

// マウス操作でカメラ制御
gl('mousemove', (event, x, y) => {
        if (isMouseDown) {
                const deltaX = x - lastMouseX
                const deltaY = y - lastMouseY

                camera.update(deltaX * 0.01, deltaY * 0.01, 0)

                lastMouseX = x
                lastMouseY = y
        }
})
```

### フライスルーカメラ

```javascript
class FlyCamera {
        constructor() {
                this.position = [0, 0, 5]
                this.rotation = [0, 0] // pitch, yaw
                this.speed = 0.1
        }

        update(input) {
                const forward = this.getForward()
                const right = this.getRight()

                if (input.forward) {
                        this.position[0] += forward[0] * this.speed
                        this.position[1] += forward[1] * this.speed
                        this.position[2] += forward[2] * this.speed
                }

                if (input.right) {
                        this.position[0] += right[0] * this.speed
                        this.position[1] += right[1] * this.speed
                        this.position[2] += right[2] * this.speed
                }
        }

        getForward() {
                const pitch = this.rotation[0]
                const yaw = this.rotation[1]

                return [Math.sin(yaw) * Math.cos(pitch), -Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)]
        }

        getRight() {
                const yaw = this.rotation[1]
                return [Math.cos(yaw), 0, -Math.sin(yaw)]
        }
}
```

## 実践課題

### 課題 1: 3D シーン

複数のオブジェクトを配置した 3D シーンを作成してください。

### 課題 2: インタラクティブライティング

マウス操作で光源を移動できるライティングシステムを作成してください。

### 課題 3: 3D パーティクル

3 次元空間でのパーティクルシステムを作成してください。

## よくある問題と解決策

### Z-ファイティング

```javascript
// 深度バッファの精度向上
const gl = createGL({
        depthBuffer: true,
        depthTest: true,
        near: 0.1, // nearを大きく
        far: 100.0, // farを小さく
})
```

### 法線の計算

```javascript
// 正しい法線変換
const normalMatrix = transpose(inverse(modelMatrix))
const worldNormal = normalize(normalMatrix.mul(normal))
```

## 次のステップ

3D 表現をマスターしたら、次は[パーティクルと物理](08-particles-physics.md)で、動的システムを学びましょう。

このチュートリアルで学んだこと：

- ✅ 3 次元座標系とプロジェクション
- ✅ ライティングシステム
- ✅ 3D オブジェクトの生成
- ✅ アニメーションと変形
- ✅ 空間効果（霧、被写界深度）
- ✅ カメラ制御システム

次の章では、パーティクルシステムや物理シミュレーションを使った動的な表現を学習します。
