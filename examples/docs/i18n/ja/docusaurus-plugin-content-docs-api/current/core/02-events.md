# Event System

## Overview

GLRE のイベントシステムは、reev ライブラリをベースとしたリアクティブプログラミングモデルを提供します。
CPU と GPU 間のデータフローを自動管理し、効率的な描画更新を実現します。

## Core Event Lifecycle

### Mount Event

エンジンの初期化プロセスを管理します：

| Phase                  | Action                     | Description                      |
| ---------------------- | -------------------------- | -------------------------------- |
| **Context Creation**   | GPU context initialization | WebGL2/WebGPU コンテキストの作成 |
| **Shader Compilation** | vs/fs compilation          | シェーダープログラムのコンパイル |
| **Resource Binding**   | uniforms/attributes setup  | GPU リソースの初期バインディング |
| **Loop Start**         | animation frame start      | 描画ループの開始                 |

```javascript
gl('mount', async () => {
        // カスタム初期化処理
        await loadAssets()
        gl.uniform('startTime', performance.now())
        console.log('Engine ready')
})
```

### Cleanup Event

リソースの解放と終了処理：

```javascript
gl('clean', () => {
        // GPU リソースの解放
        // イベントリスナーの削除
        // メモリリークの防止
        console.log('Resources cleaned')
})
```

### Resize Event

動的なキャンバスサイズ変更への対応：

```javascript
gl('resize', () => {
        const [width, height] = gl.size
        gl.uniform('iResolution', [width, height])

        // カスタムリサイズ処理
        updateProjectionMatrix(width / height)
})
```

## Interactive Events

### Mouse Interaction

```javascript
gl('mousemove', (event, x, y) => {
        // 正規化されたマウス座標 (-1 to 1)
        const normalizedX = (x - gl.size[0] / 2) / (gl.size[0] / 2)
        const normalizedY = -(y - gl.size[1] / 2) / (gl.size[1] / 2)

        gl.uniform('iMouse', [normalizedX, normalizedY])
})

// カスタムマウス処理
gl('mousedown', (event) => {
        gl.uniform('isClicking', 1.0)
})

gl('mouseup', (event) => {
        gl.uniform('isClicking', 0.0)
})
```

### Keyboard Input

```javascript
// キーボードイベントの追加
window.addEventListener('keydown', (event) => {
        gl('keydown', event.key)
})

gl('keydown', (key) => {
        switch (key) {
                case 'ArrowUp':
                        gl.uniform('direction', [0, 1])
                        break
                case 'ArrowDown':
                        gl.uniform('direction', [0, -1])
                        break
                case ' ':
                        gl.uniform('isPaused', !gl.isPaused)
                        break
        }
})
```

## Animation Loop

### Loop Event

毎フレーム実行される処理：

```javascript
gl('loop', () => {
        // 時間の更新
        const time = performance.now() / 1000
        gl.uniform('iTime', time)

        // カスタムアニメーション
        gl.uniform('rotation', Math.sin(time) * Math.PI)
})
```

### Frame Management

```
Frame Start
    │
┌───▼───┐
│ loop  │ ──── Time Update
│ event │      Uniform Updates
└───┬───┘      Custom Logic
    │
┌───▼───┐
│queue  │ ──── Batched Updates
│flush  │      GPU Synchronization
└───┬───┘
    │
┌───▼───┐
│render │ ──── GPU Execution
│ call  │      Buffer Swap
└───────┘
```

### Performance Monitoring

```javascript
let frameCount = 0
let lastTime = performance.now()

gl('loop', () => {
        frameCount++
        const currentTime = performance.now()

        if (currentTime - lastTime >= 1000) {
                const fps = (frameCount * 1000) / (currentTime - lastTime)
                console.log(`FPS: ${fps.toFixed(1)}`)
                frameCount = 0
                lastTime = currentTime
        }
})
```

## Custom Events

### Event Registration

```javascript
// カスタムイベントの定義
gl('textureLoaded', (texture) => {
        gl.uniform('hasTexture', 1.0)
        console.log('Texture ready:', texture)
})

// イベントの発火
gl.texture('mainTexture', './image.jpg').then(() => {
        gl('textureLoaded', 'mainTexture')
})
```

### Event Chain

```javascript
// 連鎖的なイベント処理
gl('dataReady', () => {
        gl('processingStart')
})

gl('processingStart', () => {
        // データ処理
        setTimeout(() => {
                gl('processingComplete')
        }, 1000)
})

gl('processingComplete', () => {
        gl.uniform('processingDone', 1.0)
})
```

## Reactive Patterns

### Durable Functions

変更検知による効率的な更新：

```javascript
// 値が変更された時のみ実行
const updateColor = durable((r, g, b) => {
        gl.uniform('color', [r, g, b, 1.0])
}, gl)

// 使用例
updateColor(1, 0, 0) // 実行される
updateColor(1, 0, 0) // スキップされる（同じ値）
updateColor(0, 1, 0) // 実行される（新しい値）
```

### State Management

```javascript
// 状態管理パターン
const state = {
        mode: 'normal',
        intensity: 1.0,
        color: [1, 1, 1],
}

const updateState = (newState) => {
        Object.assign(state, newState)
        gl.uniform('mode', state.mode === 'normal' ? 0 : 1)
        gl.uniform('intensity', state.intensity)
        gl.uniform('baseColor', state.color)
}

// 状態変更
updateState({ mode: 'enhanced', intensity: 2.0 })
```

## Error Handling

### Event Error Management

```javascript
gl('error', (error, context) => {
        console.error('GLRE Error:', error)
        console.log('Context:', context)

        // エラー復旧処理
        if (error.type === 'shader_compile') {
                gl.fragment = fallbackShader
                gl('mount') // 再マウント
        }
})

// 安全なイベント処理
const safeEvent = (eventName, handler) => {
        gl(eventName, (...args) => {
                try {
                        handler(...args)
                } catch (error) {
                        gl('error', error, { event: eventName, args })
                }
        })
}
```

### Debug Events

```javascript
// デバッグ用イベント
gl('debug', (message, data) => {
        if (process.env.NODE_ENV === 'development') {
                console.log('GLRE Debug:', message, data)
        }
})

// パフォーマンス測定
gl('perf:start', performance.now())
gl('perf:end', (startTime) => {
        const duration = performance.now() - startTime
        console.log(`Operation took: ${duration}ms`)
})
```

## Event Flow Diagram

```
User Interaction
       │
   ┌───▼───┐
   │ Input │ ──── mousemove, keydown
   │Events │      touch, wheel
   └───┬───┘
       │
   ┌───▼───┐
   │Custom │ ──── Application Logic
   │Events │      State Updates
   └───┬───┘
       │
   ┌───▼───┐
   │ loop  │ ──── Animation Frame
   │ Event │      Time Updates
   └───┬───┘
       │
   ┌───▼───┐
   │Queue  │ ──── Batched Operations
   │ Flush │      GPU Synchronization
   └───┬───┘
       │
   ┌───▼───┐
   │render │ ──── GPU Execution
   │ Call  │      Display Update
   └───────┘
```

GLRE のイベントシステムは、複雑な描画処理を宣言的で直感的な API として抽象化し、開発者がクリエイティブな作業に集中できる環境を提供します。
