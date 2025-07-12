# インタラクティブな表現

マウスやキーボードの操作に反応するビジュアル表現を作成しましょう。

## マウス操作の基本

### マウス座標の取得

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const mouse = uniform('iMouse') // マウス座標（-1～1の正規化済み）

                // マウス位置からの距離
                const distance = length(pos.xy.sub(mouse))

                // 距離に応じた色
                const intensity = oneMinus(distance)
                const color = vec3(intensity, intensity.mul(0.8), intensity.mul(1.2))

                return vec4(color, 1.0)
        },
})

// マウス移動イベントの設定
gl('mousemove', (event, x, y) => {
        const [width, height] = gl.size

        // 画面座標を -1～1 に正規化
        const normalizedX = (x / width) * 2 - 1
        const normalizedY = -((y / height) * 2 - 1) // Y軸を反転

        gl.uniform('iMouse', [normalizedX, normalizedY])
})
```

### マウスクリックの検出

```javascript
let isClicking = false

const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const mouse = uniform('iMouse')
                const clicking = uniform('isClicking')

                const distance = length(pos.xy.sub(mouse))

                // クリック時に効果を強化
                const baseIntensity = oneMinus(distance)
                const clickMultiplier = clicking.mul(2.0).add(1.0)
                const intensity = baseIntensity.mul(clickMultiplier)

                const color = vec3(intensity, intensity.mul(0.6), intensity.mul(0.4))

                return vec4(color, 1.0)
        },
})

// マウスイベントの設定
gl('mousedown', () => {
        isClicking = true
        gl.uniform('isClicking', 1.0)
})

gl('mouseup', () => {
        isClicking = false
        gl.uniform('isClicking', 0.0)
})
```

### ドラッグ操作

```javascript
let isDragging = false
let dragStart = [0, 0]
let dragCurrent = [0, 0]

const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const dragVector = uniform('dragVector')

                // ドラッグベクトルによる歪み
                const distortion = dragVector.mul(0.5)
                const distortedPos = pos.xy.add(distortion)

                // 歪んだ座標でのパターン
                const pattern = sin(distortedPos.x.mul(8.0)).mul(sin(distortedPos.y.mul(8.0)))
                const color = vec3(pattern.mul(0.5).add(0.5))

                return vec4(color, 1.0)
        },
})

gl('mousedown', (event, x, y) => {
        isDragging = true
        const [width, height] = gl.size
        dragStart = [(x / width) * 2 - 1, -((y / height) * 2 - 1)]
        dragCurrent = [...dragStart]
})

gl('mousemove', (event, x, y) => {
        if (isDragging) {
                const [width, height] = gl.size
                dragCurrent = [(x / width) * 2 - 1, -((y / height) * 2 - 1)]

                const dragVector = [dragCurrent[0] - dragStart[0], dragCurrent[1] - dragStart[1]]

                gl.uniform('dragVector', dragVector)
        }
})

gl('mouseup', () => {
        isDragging = false
        gl.uniform('dragVector', [0, 0])
})
```

## キーボード操作

### キー入力の検出

```javascript
let pressedKeys = new Set()

const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const colorMode = uniform('colorMode')

                // キー入力に応じた色の変更
                const baseColor = vec3(0.5, 0.5, 0.8)

                const redBoost = step(0.5, colorMode.x) // 'R'キー
                const greenBoost = step(0.5, colorMode.y) // 'G'キー
                const blueBoost = step(0.5, colorMode.z) // 'B'キー

                const color = vec3(
                        baseColor.r.add(redBoost.mul(0.5)),
                        baseColor.g.add(greenBoost.mul(0.5)),
                        baseColor.b.add(blueBoost.mul(0.5))
                )

                // パターンの描画
                const pattern = sin(pos.x.mul(10.0)).mul(sin(pos.y.mul(10.0)))
                const finalColor = color.mul(pattern.mul(0.5).add(0.5))

                return vec4(finalColor, 1.0)
        },
})

// キーボードイベント
document.addEventListener('keydown', (event) => {
        pressedKeys.add(event.code)
        updateColorMode()
})

document.addEventListener('keyup', (event) => {
        pressedKeys.delete(event.code)
        updateColorMode()
})

const updateColorMode = () => {
        const colorMode = [
                pressedKeys.has('KeyR') ? 1.0 : 0.0,
                pressedKeys.has('KeyG') ? 1.0 : 0.0,
                pressedKeys.has('KeyB') ? 1.0 : 0.0,
        ]
        gl.uniform('colorMode', colorMode)
}
```

### 矢印キーでのパラメータ調整

```javascript
let parameters = {
        frequency: 5.0,
        amplitude: 0.5,
        speed: 1.0,
}

const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')
                const freq = uniform('frequency')
                const amp = uniform('amplitude')
                const speed = uniform('speed')

                // パラメータを使った波のアニメーション
                const wave = sin(pos.x.mul(freq).add(time.mul(speed))).mul(amp)
                const color = vec3(wave.add(0.5))

                return vec4(color, 1.0)
        },
})

document.addEventListener('keydown', (event) => {
        switch (event.code) {
                case 'ArrowUp':
                        parameters.frequency = Math.min(parameters.frequency + 0.5, 20.0)
                        break
                case 'ArrowDown':
                        parameters.frequency = Math.max(parameters.frequency - 0.5, 1.0)
                        break
                case 'ArrowLeft':
                        parameters.speed = Math.max(parameters.speed - 0.1, 0.1)
                        break
                case 'ArrowRight':
                        parameters.speed = Math.min(parameters.speed + 0.1, 5.0)
                        break
                case 'Space':
                        parameters.amplitude = parameters.amplitude === 0.5 ? 1.0 : 0.5
                        break
        }

        // パラメータを更新
        gl.uniform('frequency', parameters.frequency)
        gl.uniform('amplitude', parameters.amplitude)
        gl.uniform('speed', parameters.speed)
})
```

## タッチ操作（モバイル対応）

### 基本的なタッチ操作

```javascript
let touches = []

const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const touch1 = uniform('touch1')
                const touch2 = uniform('touch2')
                const touchCount = uniform('touchCount')

                let color = vec3(0.1, 0.1, 0.2) // 背景色

                // 第1タッチポイント
                If(touchCount.greaterThan(0.5), () => {
                        const distance1 = length(pos.xy.sub(touch1))
                        const effect1 = smoothstep(0.5, 0.0, distance1)
                        color.assign(color.add(vec3(effect1, effect1.mul(0.8), effect1.mul(0.6))))
                })

                // 第2タッチポイント
                If(touchCount.greaterThan(1.5), () => {
                        const distance2 = length(pos.xy.sub(touch2))
                        const effect2 = smoothstep(0.5, 0.0, distance2)
                        color.assign(color.add(vec3(effect2.mul(0.6), effect2, effect2.mul(0.8))))
                })

                return vec4(color, 1.0)
        },
})

// タッチイベント
const handleTouches = (event) => {
        const rect = gl.canvas.getBoundingClientRect()
        touches = []

        for (let i = 0; i < event.touches.length && i < 2; i++) {
                const touch = event.touches[i]
                const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1
                const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1)
                touches.push([x, y])
        }

        gl.uniform('touchCount', touches.length)
        gl.uniform('touch1', touches[0] || [0, 0])
        gl.uniform('touch2', touches[1] || [0, 0])
}

gl.canvas.addEventListener('touchstart', handleTouches)
gl.canvas.addEventListener('touchmove', handleTouches)
gl.canvas.addEventListener('touchend', handleTouches)
```

### ピンチ操作

```javascript
let pinchDistance = 1.0
let pinchCenter = [0, 0]

const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const scale = uniform('pinchScale')
                const center = uniform('pinchCenter')

                // ピンチによるズーム効果
                const scaledPos = pos.xy.sub(center).mul(scale).add(center)

                // パターンの描画
                const pattern = sin(scaledPos.x.mul(8.0)).mul(sin(scaledPos.y.mul(8.0)))
                const color = vec3(pattern.mul(0.5).add(0.5))

                return vec4(color, 1.0)
        },
})

const calculatePinch = (touches) => {
        if (touches.length >= 2) {
                const touch1 = touches[0]
                const touch2 = touches[1]

                // 距離の計算
                const dx = touch2[0] - touch1[0]
                const dy = touch2[1] - touch1[1]
                const distance = Math.sqrt(dx * dx + dy * dy)

                // 中心点の計算
                const centerX = (touch1[0] + touch2[0]) / 2
                const centerY = (touch1[1] + touch2[1]) / 2

                return { distance, center: [centerX, centerY] }
        }

        return null
}

let initialPinch = null

gl.canvas.addEventListener('touchstart', (event) => {
        if (event.touches.length === 2) {
                const pinch = calculatePinch(touches)
                if (pinch) {
                        initialPinch = pinch
                }
        }
})

gl.canvas.addEventListener('touchmove', (event) => {
        if (event.touches.length === 2 && initialPinch) {
                const currentPinch = calculatePinch(touches)
                if (currentPinch) {
                        const scale = currentPinch.distance / initialPinch.distance
                        gl.uniform('pinchScale', scale)
                        gl.uniform('pinchCenter', currentPinch.center)
                }
        }
})
```

## デバイスセンサー

### 加速度センサー

```javascript
let acceleration = [0, 0, 0]

const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const accel = uniform('acceleration')

                // 重力方向による効果
                const gravity = normalize(accel)
                const gravityEffect = dot(pos.xy, gravity.xy)

                // 重力方向にグラデーション
                const color = vec3(
                        gravityEffect.mul(0.5).add(0.5),
                        abs(gravityEffect),
                        oneMinus(gravityEffect).mul(0.5).add(0.5)
                )

                return vec4(color, 1.0)
        },
})

// 加速度センサーの使用
if ('DeviceMotionEvent' in window) {
        window.addEventListener('devicemotion', (event) => {
                const accel = event.accelerationIncludingGravity
                if (accel) {
                        acceleration = [accel.x || 0, accel.y || 0, accel.z || 0]
                        gl.uniform('acceleration', acceleration)
                }
        })
}
```

### ジャイロスコープ

```javascript
let orientation = [0, 0, 0]

const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const rotation = uniform('deviceRotation')

                // デバイスの回転に応じた座標変換
                const angle = rotation.z.mul(0.01) // 角度を調整
                const cosA = cos(angle)
                const sinA = sin(angle)

                const rotatedPos = vec2(pos.x.mul(cosA).sub(pos.y.mul(sinA)), pos.x.mul(sinA).add(pos.y.mul(cosA)))

                // 回転した座標でのパターン
                const pattern = sin(rotatedPos.x.mul(10.0)).mul(sin(rotatedPos.y.mul(10.0)))
                const color = vec3(pattern.mul(0.5).add(0.5))

                return vec4(color, 1.0)
        },
})

// ジャイロスコープの使用
if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', (event) => {
                orientation = [
                        event.alpha || 0, // Z軸周りの回転
                        event.beta || 0, // X軸周りの回転
                        event.gamma || 0, // Y軸周りの回転
                ]
                gl.uniform('deviceRotation', orientation)
        })
}
```

## 高度なインタラクション

### マルチタッチジェスチャー

```javascript
class GestureRecognizer {
        constructor() {
                this.touches = new Map()
                this.gestures = []
        }

        addTouch(id, x, y) {
                this.touches.set(id, { x, y, startTime: Date.now() })
        }

        updateTouch(id, x, y) {
                if (this.touches.has(id)) {
                        const touch = this.touches.get(id)
                        touch.x = x
                        touch.y = y
                }
        }

        removeTouch(id) {
                this.touches.delete(id)
        }

        detectSwipe() {
                // スワイプジェスチャーの検出ロジック
                for (const [id, touch] of this.touches) {
                        const duration = Date.now() - touch.startTime
                        if (duration > 100 && duration < 500) {
                                // スワイプ判定
                                return { type: 'swipe', direction: this.getSwipeDirection(touch) }
                        }
                }
                return null
        }

        getSwipeDirection(touch) {
                // スワイプ方向の計算
                // 実装省略
                return 'left'
        }
}

const gestureRecognizer = new GestureRecognizer()

// ジェスチャーに応じたエフェクト
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const gestureType = uniform('gestureType')

                // ジェスチャーに応じた視覚効果
                // 実装に応じてカスタマイズ

                return vec4(vec3(0.5), 1.0)
        },
})
```

### パーティクルのマウス追従

```javascript
class ParticleSystem {
        constructor(count) {
                this.particles = []
                for (let i = 0; i < count; i++) {
                        this.particles.push({
                                x: Math.random() * 2 - 1,
                                y: Math.random() * 2 - 1,
                                vx: 0,
                                vy: 0,
                        })
                }
        }

        update(mouseX, mouseY) {
                this.particles.forEach((particle) => {
                        // マウスに向かう力
                        const dx = mouseX - particle.x
                        const dy = mouseY - particle.y
                        const distance = Math.sqrt(dx * dx + dy * dy)

                        if (distance > 0) {
                                const force = 0.001 / (distance + 0.1)
                                particle.vx += dx * force
                                particle.vy += dy * force
                        }

                        // 摩擦
                        particle.vx *= 0.99
                        particle.vy *= 0.99

                        // 位置更新
                        particle.x += particle.vx
                        particle.y += particle.vy

                        // 境界処理
                        if (particle.x < -1) particle.x = 1
                        if (particle.x > 1) particle.x = -1
                        if (particle.y < -1) particle.y = 1
                        if (particle.y > 1) particle.y = -1
                })
        }

        getPositions() {
                return this.particles.flatMap((p) => [p.x, p.y])
        }
}

const particleSystem = new ParticleSystem(50)

const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const particles = uniform('particlePositions')

                let color = vec3(0.05, 0.05, 0.1) // 背景色

                // パーティクルの描画
                Loop(25, ({ i }) => {
                        // 50個のパーティクル（x,y で2要素ずつ）
                        const particlePos = vec2(particles[i * 2], particles[i * 2 + 1])

                        const distance = length(pos.xy.sub(particlePos))
                        const particle = smoothstep(0.05, 0.0, distance)

                        color.assign(color.add(vec3(particle).mul(0.8)))
                })

                return vec4(color, 1.0)
        },
})

// アニメーションループ
gl('loop', () => {
        particleSystem.update(mouseX, mouseY)
        gl.uniform('particlePositions', particleSystem.getPositions())
})
```

## 実践課題

### 課題 1: インタラクティブペイント

マウスドラッグで絵を描けるアプリケーションを作成してください。

### 課題 2: 音楽ビジュアライザー

音声入力に反応するビジュアライザーを作成してください。

### 課題 3: ゲーム UI

簡単なゲームの UI エフェクト（ボタンホバー、メニューアニメーション）を作成してください。

## よくある問題と解決策

### イベントの重複実行

```javascript
// 問題: 同じイベントが複数回登録される
// 解決: イベントリスナーの適切な管理

class InteractionManager {
        constructor(gl) {
                this.gl = gl
                this.boundEvents = new Map()
        }

        addMouseMove(handler) {
                if (!this.boundEvents.has('mousemove')) {
                        const boundHandler = (event, x, y) => handler(event, x, y)
                        this.gl('mousemove', boundHandler)
                        this.boundEvents.set('mousemove', boundHandler)
                }
        }

        removeAll() {
                this.boundEvents.clear()
        }
}
```

### パフォーマンスの問題

```javascript
// イベント処理の最適化
let lastUpdateTime = 0
const UPDATE_INTERVAL = 16 // 60FPS

gl('mousemove', (event, x, y) => {
        const now = Date.now()
        if (now - lastUpdateTime > UPDATE_INTERVAL) {
                updateMousePosition(x, y)
                lastUpdateTime = now
        }
})
```

## 次のステップ

インタラクティブな表現をマスターしたら、次は[3D 表現と空間](../advanced/07-3d-graphics.md)で、立体的なビジュアルを学びましょう。

このチュートリアルで学んだこと：

- ✅ マウス操作（移動、クリック、ドラッグ）
- ✅ キーボード入力の処理
- ✅ タッチ操作とジェスチャー
- ✅ デバイスセンサーの活用
- ✅ 高度なインタラクション
- ✅ パフォーマンス最適化

次の章では、3 次元空間での表現や、立体的なオブジェクトの操作方法を学習します。
