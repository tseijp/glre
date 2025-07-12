# 画像とテクスチャ

外部画像を読み込んで加工する方法と、テクスチャを使った表現技法を学びましょう。

## 画像の読み込み

### 基本的な画像読み込み

```javascript
const gl = createGL({
        fragment: () => {
                const uv = builtin('position').xy.mul(0.5).add(0.5) // -1~1 を 0~1 に変換

                // テクスチャからピクセル色を取得
                const textureColor = texture(uniform('mainTexture'), uv)

                return textureColor
        },
})

// 画像をロード
gl.texture('mainTexture', './images/sample.jpg')
```

### UV 座標の理解

UV 座標は画像上の位置を表す座標系です：

```
(0,0) -------- (1,0)
  |              |
  |     画像     |
  |              |
(0,1) -------- (1,1)
```

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // 画面座標(-1~1)からUV座標(0~1)に変換
                const uv = pos.xy.mul(0.5).add(0.5)

                // UV座標の可視化
                const uvColor = vec4(uv.x, uv.y, 0.0, 1.0)

                return uvColor
        },
})
```

### アスペクト比の調整

画像が歪まないようにアスペクト比を調整します。

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const resolution = uniform('iResolution')

                // 画面のアスペクト比
                const screenAspect = resolution.x.div(resolution.y)

                // テクスチャのアスペクト比（例：16:9の画像）
                const textureAspect = 16.0 / 9.0

                // アスペクト比を考慮したUV座標
                let uv = pos.xy.mul(0.5).add(0.5)

                If(screenAspect.greaterThan(textureAspect), () => {
                        // 画面が横長の場合、横方向を調整
                        const scale = textureAspect.div(screenAspect)
                        uv.assign(vec2(uv.x.mul(scale).add((1.0 - scale).mul(0.5)), uv.y))
                }).Else(() => {
                        // 画面が縦長の場合、縦方向を調整
                        const scale = screenAspect.div(textureAspect)
                        uv.assign(vec2(uv.x, uv.y.mul(scale).add((1.0 - scale).mul(0.5))))
                })

                const textureColor = texture(uniform('mainTexture'), uv)
                return textureColor
        },
})
```

## 画像フィルタ

### ぼかし効果

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const uv = pos.xy.mul(0.5).add(0.5)
                const resolution = uniform('iResolution')

                // ピクセルサイズ
                const pixelSize = vec2(1.0).div(resolution)

                let blurColor = vec4(0.0)
                const blurRadius = 5.0
                const samples = 9.0

                // 3x3のサンプリング
                Loop(3, ({ i }) => {
                        Loop(3, ({ j }) => {
                                const offset = vec2(
                                        (float(i) - 1.0) * pixelSize.x * blurRadius,
                                        (float(j) - 1.0) * pixelSize.y * blurRadius
                                )

                                const sampleUV = uv.add(offset)
                                const sampleColor = texture(uniform('mainTexture'), sampleUV)

                                blurColor.assign(blurColor.add(sampleColor))
                        })
                })

                // 平均を取る
                blurColor.assign(blurColor.div(samples))

                return blurColor
        },
})
```

### エッジ検出

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const uv = pos.xy.mul(0.5).add(0.5)
                const resolution = uniform('iResolution')

                const pixelSize = vec2(1.0).div(resolution)

                // Sobelフィルタのカーネル
                const sobelX = [
                        [-1, 0, 1],
                        [-2, 0, 2],
                        [-1, 0, 1],
                ]
                const sobelY = [
                        [-1, -2, -1],
                        [0, 0, 0],
                        [1, 2, 1],
                ]

                let gradientX = 0.0
                let gradientY = 0.0

                Loop(3, ({ i }) => {
                        Loop(3, ({ j }) => {
                                const offset = vec2((float(i) - 1.0) * pixelSize.x, (float(j) - 1.0) * pixelSize.y)

                                const sampleColor = texture(uniform('mainTexture'), uv.add(offset))
                                const luminance = dot(sampleColor.rgb, vec3(0.299, 0.587, 0.114))

                                gradientX.assign(gradientX.add(luminance.mul(sobelX[i][j])))
                                gradientY.assign(gradientY.add(luminance.mul(sobelY[i][j])))
                        })
                })

                const edgeStrength = sqrt(gradientX.mul(gradientX).add(gradientY.mul(gradientY)))

                return vec4(vec3(edgeStrength), 1.0)
        },
})
```

### セピア調

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const uv = pos.xy.mul(0.5).add(0.5)

                const originalColor = texture(uniform('mainTexture'), uv)

                // セピア調変換行列
                const sepiaR = originalColor.r
                        .mul(0.393)
                        .add(originalColor.g.mul(0.769))
                        .add(originalColor.b.mul(0.189))
                const sepiaG = originalColor.r
                        .mul(0.349)
                        .add(originalColor.g.mul(0.686))
                        .add(originalColor.b.mul(0.168))
                const sepiaB = originalColor.r
                        .mul(0.272)
                        .add(originalColor.g.mul(0.534))
                        .add(originalColor.b.mul(0.131))

                const sepiaColor = vec4(sepiaR, sepiaG, sepiaB, originalColor.a)

                return sepiaColor
        },
})
```

## テクスチャ座標の操作

### テクスチャの繰り返し

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // 座標を拡大して繰り返し
                const scale = 3.0
                const uv = fract(pos.xy.mul(0.5).add(0.5).mul(scale))

                const textureColor = texture(uniform('mainTexture'), uv)

                return textureColor
        },
})
```

### テクスチャの回転

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // 中心を原点とした座標
                const centeredPos = pos.xy

                // 回転
                const angle = time.mul(0.5)
                const cosA = cos(angle)
                const sinA = sin(angle)
                const rotatedPos = vec2(
                        centeredPos.x.mul(cosA).sub(centeredPos.y.mul(sinA)),
                        centeredPos.x.mul(sinA).add(centeredPos.y.mul(cosA))
                )

                // UV座標に変換
                const uv = rotatedPos.mul(0.5).add(0.5)

                const textureColor = texture(uniform('mainTexture'), uv)

                return textureColor
        },
})
```

### 魚眼レンズ効果

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                const radius = length(pos.xy)
                const angle = atan2(pos.y, pos.x)

                // 魚眼効果の計算
                const distortedRadius = radius.mul(radius).mul(0.5).add(radius.mul(0.5))

                const distortedPos = vec2(cos(angle).mul(distortedRadius), sin(angle).mul(distortedRadius))

                const uv = distortedPos.mul(0.5).add(0.5)

                // 範囲外は黒にする
                const inBounds = step(radius, 1.0)
                const textureColor = texture(uniform('mainTexture'), uv).mul(inBounds)

                return textureColor
        },
})
```

## マルチテクスチャ

### 複数画像の合成

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const uv = pos.xy.mul(0.5).add(0.5)

                // 複数のテクスチャを読み込み
                const texture1 = texture(uniform('texture1'), uv)
                const texture2 = texture(uniform('texture2'), uv)
                const maskTexture = texture(uniform('maskTexture'), uv)

                // マスクを使った合成
                const mask = maskTexture.r
                const blendedColor = mix(texture1, texture2, mask)

                return blendedColor
        },
})

// 複数画像をロード
gl.texture('texture1', './images/background.jpg')
gl.texture('texture2', './images/overlay.jpg')
gl.texture('maskTexture', './images/mask.jpg')
```

### グラデーションマスク

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const uv = pos.xy.mul(0.5).add(0.5)

                const texture1 = texture(uniform('texture1'), uv)
                const texture2 = texture(uniform('texture2'), uv)

                // プロシージャルなグラデーションマスク
                const gradient = uv.x // 左から右へのグラデーション

                // 滑らかな境界
                const smoothGradient = smoothstep(0.2, 0.8, gradient)

                const blendedColor = mix(texture1, texture2, smoothGradient)

                return blendedColor
        },
})
```

## 動的テクスチャ効果

### テクスチャスクロール

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // スクロール速度
                const scrollSpeed = vec2(0.1, 0.05)

                // 時間によるオフセット
                const offset = time.mul(scrollSpeed)

                let uv = pos.xy.mul(0.5).add(0.5)
                uv = uv.add(offset)

                // 繰り返しのためにfractで正規化
                uv = fract(uv)

                const textureColor = texture(uniform('mainTexture'), uv)

                return textureColor
        },
})
```

### 波打つテクスチャ

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                let uv = pos.xy.mul(0.5).add(0.5)

                // 波による歪み
                const waveAmplitude = 0.05
                const waveFrequency = 8.0
                const waveSpeed = 2.0

                const waveX = sin(uv.y.mul(waveFrequency).add(time.mul(waveSpeed))).mul(waveAmplitude)
                const waveY = sin(uv.x.mul(waveFrequency).add(time.mul(waveSpeed))).mul(waveAmplitude)

                uv = uv.add(vec2(waveX, waveY))

                const textureColor = texture(uniform('mainTexture'), uv)

                return textureColor
        },
})
```

### パーティクルテクスチャ

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')
                const uv = pos.xy.mul(0.5).add(0.5)

                let finalColor = vec4(0.0)

                // 複数のパーティクル層
                Loop(3, ({ layer }) => {
                        const layerFloat = float(layer)

                        // 各層の設定
                        const scale = layerFloat.add(1.0).mul(2.0)
                        const speed = layerFloat.mul(0.3).add(0.1)

                        // スクロール
                        const scrollOffset = vec2(0.0, time.mul(speed))
                        let layerUV = uv.mul(scale).add(scrollOffset)
                        layerUV = fract(layerUV)

                        // テクスチャサンプリング
                        const layerColor = texture(uniform('particleTexture'), layerUV)

                        // ブレンド
                        const alpha = layerColor.a.mul(0.3).div(layerFloat.add(1.0))
                        finalColor.assign(finalColor.add(layerColor.mul(alpha)))
                })

                return finalColor
        },
})
```

## テクスチャ作成技法

### プロシージャルテクスチャ

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const uv = pos.xy.mul(0.5).add(0.5)

                // 木目調パターン
                const rings = sin(length(uv.sub(0.5)).mul(50.0))
                        .mul(0.5)
                        .add(0.5)
                const grain = sin(uv.x.mul(200.0)).mul(sin(uv.y.mul(180.0)))

                const woodPattern = rings.add(grain.mul(0.1))

                // 木の色調
                const woodColor = vec3(0.6, 0.4, 0.2).mul(woodPattern)

                return vec4(woodColor, 1.0)
        },
})
```

### ノイズテクスチャ

```javascript
// 簡単なノイズ関数
const noise = (uv) => {
        return fract(sin(dot(uv, vec2(12.9898, 78.233))).mul(43758.5453))
}

const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const uv = pos.xy.mul(0.5).add(0.5)

                // マルチオクターブノイズ
                let noiseValue = 0.0
                let amplitude = 0.5
                let frequency = 2.0

                Loop(6, ({ i }) => {
                        noiseValue.assign(noiseValue.add(noise(uv.mul(frequency)).mul(amplitude)))
                        amplitude.assign(amplitude.mul(0.5))
                        frequency.assign(frequency.mul(2.0))
                })

                const color = vec3(noiseValue)

                return vec4(color, 1.0)
        },
})
```

## パフォーマンス最適化

### テクスチャ圧縮

```javascript
// 複数のテクスチャ品質を用意
const loadOptimizedTexture = (name, basePath) => {
        // デバイスの性能に応じて画質を選択
        const isHighEnd = navigator.hardwareConcurrency > 4
        const quality = isHighEnd ? 'high' : 'medium'

        gl.texture(name, `${basePath}_${quality}.jpg`)
}

loadOptimizedTexture('mainTexture', './images/background')
```

### ミップマップの活用

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const uv = pos.xy.mul(0.5).add(0.5)

                // 距離に応じたLOD
                const distance = length(pos.xy)
                const lod = distance.mul(3.0)

                // ミップマップレベルを指定してサンプリング
                const textureColor = texture(uniform('mainTexture'), uv, lod)

                return textureColor
        },
})
```

## 実践課題

### 課題 1: フォトフィルタ

Instagram 風のフィルタ効果を複数作成してください。

### 課題 2: テクスチャアニメーション

複数のテクスチャを使って、映画のクレジットロール風のアニメーションを作成してください。

### 課題 3: インタラクティブ画像処理

マウスの位置に応じて画像フィルタの強度が変化するエフェクトを作成してください。

## よくある問題と解決策

### 画像が表示されない

```javascript
// 画像の読み込み完了を待つ
gl.texture('mainTexture', './images/sample.jpg')
        .then(() => {
                console.log('テクスチャの読み込み完了')
        })
        .catch((error) => {
                console.error('テクスチャの読み込み失敗:', error)
        })
```

### UV 座標が期待通りでない

```javascript
// UV座標のデバッグ表示
const debugUV = () => {
        const pos = builtin('position')
        const uv = pos.xy.mul(0.5).add(0.5)

        // UV座標を色で表示
        return vec4(uv.x, uv.y, 0.0, 1.0)
}
```

### テクスチャがぼやける

```javascript
// テクスチャフィルタリングの設定
gl.texture('mainTexture', './images/sample.jpg', {
        minFilter: 'nearest', // ピクセルアート用
        magFilter: 'nearest',
})
```

## 次のステップ

画像とテクスチャの操作をマスターしたら、次は[インタラクティブな表現](06-interactive-effects.md)で、ユーザー操作に反応するエフェクトを学びましょう。

このチュートリアルで学んだこと：

- ✅ 画像の読み込みと UV 座標
- ✅ 画像フィルタ（ぼかし、エッジ検出、セピア）
- ✅ テクスチャ座標の操作
- ✅ マルチテクスチャ合成
- ✅ 動的テクスチャ効果
- ✅ プロシージャルテクスチャ作成

次の章では、マウスやキーボードの操作に反応するインタラクティブなビジュアル表現を学習します。
