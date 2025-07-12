# 時間とアニメーション

時間の概念を使って、動的に変化するビジュアルを作成しましょう。

## 時間の基本

### 時間の取得

GLRE では、経過時間を簡単に取得できます。

```javascript
const gl = createGL({
        fragment: () => {
                // 経過時間を取得（秒単位）
                const time = uniform('iTime')

                // 時間で色を変化させる
                const red = sin(time).mul(0.5).add(0.5)
                const green = sin(time.add(2.0)).mul(0.5).add(0.5)
                const blue = sin(time.add(4.0)).mul(0.5).add(0.5)

                return vec4(red, green, blue, 1.0)
        },
})

// 時間の更新を開始
gl('loop', () => {
        const time = performance.now() / 1000
        gl.uniform('iTime', time)
})
```

### 時間ベースの基本パターン

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // 振動パターン
                const oscillation = sin(time.mul(2.0)).mul(0.5).add(0.5)

                // 一定速度で増加
                const linear = fract(time.mul(0.5))

                // イージング（滑らかな変化）
                const eased = sin(time.mul(1.5)).mul(0.5).add(0.5)
                const smoothed = eased.mul(eased).mul(3.0).sub(eased.mul(eased).mul(2.0))

                // 位置に応じて異なるパターンを表示
                const pattern = mix(oscillation, mix(linear, smoothed, step(0.0, pos.x)), step(0.3, abs(pos.y)))

                const color = vec3(pattern, pattern.mul(0.8), pattern.mul(1.2))
                return vec4(color, 1.0)
        },
})
```

## アニメーションパターン

### 回転アニメーション

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // 回転角度
                const angle = time.mul(1.0)

                // 回転行列の適用
                const cosA = cos(angle)
                const sinA = sin(angle)
                const rotatedPos = vec2(pos.x.mul(cosA).sub(pos.y.mul(sinA)), pos.x.mul(sinA).add(pos.y.mul(cosA)))

                // 回転したストライプパターン
                const stripe = sin(rotatedPos.x.mul(10.0)).mul(0.5).add(0.5)

                const color = vec3(stripe, stripe.mul(0.7), stripe.mul(0.9))
                return vec4(color, 1.0)
        },
})
```

### スケールアニメーション

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // パルス効果
                const pulse = sin(time.mul(3.0)).mul(0.3).add(1.0)

                // スケールした座標
                const scaledPos = pos.xy.div(pulse)

                // 中心からの距離
                const distance = length(scaledPos)

                // 円形パターン
                const circle = smoothstep(0.5, 0.45, distance)

                const color = vec3(circle, circle.mul(0.8), circle.mul(1.2))
                return vec4(color, 1.0)
        },
})
```

### 波の伝播

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // 中心からの距離
                const distance = length(pos.xy)

                // 時間と距離を組み合わせた波
                const wave = sin(distance.mul(20.0).sub(time.mul(8.0)))

                // 減衰効果
                const attenuation = oneMinus(distance)
                const finalWave = wave.mul(attenuation).mul(0.5).add(0.5)

                const color = vec3(finalWave, finalWave.mul(0.6), finalWave.mul(1.4))
                return vec4(color, 1.0)
        },
})
```

## 周期的なアニメーション

### 複数の周期の組み合わせ

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // 異なる周期の波を組み合わせ
                const wave1 = sin(time.mul(1.0))
                const wave2 = sin(time.mul(1.618)) // 黄金比
                const wave3 = sin(time.mul(0.707)) // √2/2

                // 複合波
                const composite = wave1.add(wave2.mul(0.5)).add(wave3.mul(0.25))
                const normalized = composite.div(1.75).mul(0.5).add(0.5)

                // 位置による変調
                const modulation = sin(pos.x.mul(5.0)).mul(sin(pos.y.mul(5.0)))
                const final = normalized.mul(modulation.mul(0.5).add(0.5))

                const color = vec3(final, final.mul(0.8), final.mul(1.2))
                return vec4(color, 1.0)
        },
})
```

### リサージュ図形

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // リサージュ曲線のパラメータ
                const a = 3.0
                const b = 4.0
                const delta = time.mul(0.5)

                // リサージュ曲線の軌跡
                const x = sin(time.mul(a).add(delta)).mul(0.7)
                const y = sin(time.mul(b)).mul(0.7)
                const tracePos = vec2(x, y)

                // 現在位置からの距離
                const distance = length(pos.xy.sub(tracePos))

                // 軌跡の描画
                const trace = smoothstep(0.1, 0.05, distance)

                // 軌跡の履歴（フェード効果）
                const history = sin(distance.mul(30.0).sub(time.mul(5.0)))
                        .mul(0.5)
                        .add(0.5)
                const historyMask = smoothstep(0.8, 0.2, distance)

                const final = max(trace, history.mul(historyMask).mul(0.3))
                const color = vec3(final, final.mul(0.7), final.mul(1.3))

                return vec4(color, 1.0)
        },
})
```

## イージング関数

### 基本的なイージング

```javascript
// よく使われるイージング関数
const easeInOut = (t) => {
        return t.mul(t).mul(3.0).sub(t.mul(t).mul(2.0))
}

const easeInQuart = (t) => {
        return t.mul(t).mul(t).mul(t)
}

const easeOutBounce = (t) => {
        const n1 = 7.5625
        const d1 = 2.75

        return If(t.lessThan(1.0 / d1), () => {
                return n1.mul(t).mul(t)
        })
                .ElseIf(t.lessThan(2.0 / d1), () => {
                        const t2 = t.sub(1.5 / d1)
                        return n1.mul(t2).mul(t2).add(0.75)
                })
                .ElseIf(t.lessThan(2.5 / d1), () => {
                        const t2 = t.sub(2.25 / d1)
                        return n1.mul(t2).mul(t2).add(0.9375)
                })
                .Else(() => {
                        const t2 = t.sub(2.625 / d1)
                        return n1.mul(t2).mul(t2).add(0.984375)
                })
}

const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // 0-1の周期的な値
                const t = fract(time.mul(0.5))

                // 異なるイージングを適用
                const linear = t
                const smooth = easeInOut(t)
                const bounce = easeOutBounce(t)

                // Y座標で表示するイージングを選択
                const y01 = pos.y.mul(0.5).add(0.5)
                const easing = mix(linear, mix(smooth, bounce, step(0.66, y01)), step(0.33, y01))

                // X座標と比較してグラフ表示
                const x01 = pos.x.mul(0.5).add(0.5)
                const graph = smoothstep(0.02, 0.0, abs(easing.sub(x01)))

                const color = vec3(graph, graph.mul(0.8), graph.mul(1.2))
                return vec4(color, 1.0)
        },
})
```

## 時間ベースのエフェクト

### パーティクル風エフェクト

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                let finalColor = vec3(0.0)

                // 複数のパーティクルをシミュレート
                Loop(8, ({ i }) => {
                        const id = float(i)

                        // パーティクルの初期位置（疑似ランダム）
                        const seed = id.mul(12.9898)
                        const offsetX = sin(seed).mul(2.0)
                        const offsetY = cos(seed.mul(1.618)).mul(2.0)

                        // 時間による移動
                        const moveSpeed = id.mul(0.1).add(0.5)
                        const currentPos = vec2(
                                offsetX.add(sin(time.mul(moveSpeed))),
                                offsetY.add(cos(time.mul(moveSpeed).add(id)))
                        )

                        // パーティクルからの距離
                        const distance = length(pos.xy.sub(currentPos))

                        // パーティクルの描画
                        const particle = smoothstep(0.2, 0.05, distance)

                        // 色の変化
                        const hue = id.mul(0.618).add(time.mul(0.1))
                        const particleColor = vec3(
                                sin(hue.mul(6.28)).mul(0.5).add(0.5),
                                sin(hue.mul(6.28).add(2.09)).mul(0.5).add(0.5),
                                sin(hue.mul(6.28).add(4.18)).mul(0.5).add(0.5)
                        )

                        finalColor.assign(finalColor.add(particleColor.mul(particle)))
                })

                return vec4(finalColor, 1.0)
        },
})
```

### カラフルな万華鏡

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // 極座標変換
                let radius = length(pos.xy)
                let angle = atan2(pos.y, pos.x)

                // 万華鏡効果（対称性）
                const sections = 6.0
                angle = angle.div(6.28318).mul(sections)
                angle = abs(fract(angle).sub(0.5)).mul(2.0)
                angle = angle.mul(6.28318).div(sections)

                // 時間による回転
                angle = angle.add(time.mul(0.5))

                // 半径方向の波
                radius = radius.add(sin(angle.mul(8.0).add(time.mul(2.0))).mul(0.1))

                // パターンの生成
                const pattern1 = sin(radius.mul(20.0).sub(time.mul(3.0)))
                const pattern2 = sin(angle.mul(12.0).add(radius.mul(15.0)))

                const combined = pattern1.mul(pattern2).mul(0.5).add(0.5)

                // レインボーカラー
                const colorPhase = angle.add(time)
                const color = vec3(
                        sin(colorPhase).mul(0.5).add(0.5),
                        sin(colorPhase.add(2.09)).mul(0.5).add(0.5),
                        sin(colorPhase.add(4.18)).mul(0.5).add(0.5)
                ).mul(combined)

                return vec4(color, 1.0)
        },
})
```

## アニメーション制御

### 一時停止と再生

```javascript
let isPaused = false
let pausedTime = 0

const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                // 通常のアニメーション処理
                const wave = sin(time.mul(2.0)).mul(0.5).add(0.5)
                return vec4(vec3(wave), 1.0)
        },
})

gl('loop', () => {
        if (!isPaused) {
                const currentTime = performance.now() / 1000
                gl.uniform('iTime', currentTime - pausedTime)
        }
})

// スペースキーで一時停止/再生を切り替え
document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
                if (isPaused) {
                        pausedTime = performance.now() / 1000 - pausedTime
                        isPaused = false
                } else {
                        pausedTime = performance.now() / 1000 - pausedTime
                        isPaused = true
                }
        }
})
```

### 速度調整

```javascript
let animationSpeed = 1.0

const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const speed = uniform('animationSpeed')

                const adjustedTime = time.mul(speed)
                const wave = sin(adjustedTime.mul(2.0)).mul(0.5).add(0.5)

                return vec4(vec3(wave), 1.0)
        },
})

gl('loop', () => {
        const time = performance.now() / 1000
        gl.uniform('iTime', time)
        gl.uniform('animationSpeed', animationSpeed)
})

// キーで速度調整
document.addEventListener('keydown', (event) => {
        switch (event.code) {
                case 'ArrowUp':
                        animationSpeed = Math.min(animationSpeed + 0.1, 3.0)
                        break
                case 'ArrowDown':
                        animationSpeed = Math.max(animationSpeed - 0.1, 0.1)
                        break
                case 'KeyR':
                        animationSpeed = 1.0
                        break
        }
})
```

## 実践課題

### 課題 1: 時計の作成

現在時刻を表示するアナログ時計を作成してください。

### 課題 2: 波の干渉

複数の波源からの波が干渉するパターンを作成してください。

### 課題 3: カスタムイージング

オリジナルのイージング関数を作成して、独特なアニメーションを実現してください。

## よくある問題と解決策

### アニメーションが滑らかでない

```javascript
// 問題: フレームレートが不安定
// 解決: requestAnimationFrame を使用

let lastTime = 0

const animate = (currentTime) => {
        const deltaTime = (currentTime - lastTime) / 1000
        lastTime = currentTime

        // デルタタイムを使った安定したアニメーション
        gl.uniform('iTime', currentTime / 1000)
        gl.uniform('deltaTime', deltaTime)

        requestAnimationFrame(animate)
}

requestAnimationFrame(animate)
```

### 時間の精度問題

```javascript
// より精密な時間管理
const startTime = performance.now()

gl('loop', () => {
        const elapsed = (performance.now() - startTime) / 1000
        gl.uniform('iTime', elapsed)
})
```

## 次のステップ

時間とアニメーションの基本をマスターしたら、次は[図形とパターン](../techniques/04-shapes-patterns.md)で、より複雑な形状の描画を学びましょう。

このチュートリアルで学んだこと：

- ✅ 時間の取得と活用
- ✅ 基本的なアニメーションパターン
- ✅ 周期的なアニメーション
- ✅ イージング関数の実装
- ✅ 複合的なエフェクト
- ✅ アニメーション制御

次の章では、基本図形から複雑なパターンまで、様々な形状を描画する技法を学習します。
