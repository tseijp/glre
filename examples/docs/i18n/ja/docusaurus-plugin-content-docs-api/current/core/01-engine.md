# Core Engine

## createGL Function

GLRE エンジンの中核となる初期化関数です。WebGL2/WebGPU の抽象化レイヤーを提供し、リアクティブな GPU 操作環境を構築します。

### Basic Usage

| Parameter  | Type           | Default              | Description                |
| ---------- | -------------- | -------------------- | -------------------------- |
| `isWebGL`  | `boolean`      | `true`               | WebGL2 使用フラグ          |
| `isLoop`   | `boolean`      | `true`               | アニメーションループ有効化 |
| `count`    | `number`       | `6`                  | 描画頂点数                 |
| `width`    | `number`       | `window.innerWidth`  | キャンバス幅               |
| `height`   | `number`       | `window.innerHeight` | キャンバス高さ             |
| `vertex`   | `string\|Node` | default vertex       | バーテックスシェーダー     |
| `fragment` | `string\|Node` | default fragment     | フラグメントシェーダー     |

### Configuration Examples

```javascript
// WebGL2での基本設定
const gl = createGL({
        isWebGL: true,
        width: 800,
        height: 600,
        fragment: vec4(fract(position.xy.div(iResolution)), 0, 1),
})

// WebGPUでの高度な設定
const gl = createGL({
        isWebGL: false,
        count: 36,
        vertex: customVertexShader,
        fragment: customFragmentShader,
})
```

### Backend Selection

```
User Configuration
        │
┌───────▼───────┐
│ isWebGL: bool │
└───────┬───────┘
        │
   ┌────▼────┐
   │ Check   │ ──── GPU Support
   │ Support │      Available?
   └────┬────┘
        │
   ┌────▼────┐     ┌─────────────┐
   │ WebGL2  │ ──► │ WebGL2      │
   │ Backend │     │ Context     │
   └─────────┘     └─────────────┘
        │
   ┌────▼────┐     ┌─────────────┐
   │ WebGPU  │ ──► │ WebGPU      │
   │ Backend │     │ Context     │
   └─────────┘     └─────────────┘
```

## Event System

GLRE のリアクティブ性の基盤となるイベント駆動アーキテクチャです。

### Core Events

| Event       | Trigger                | Purpose                |
| ----------- | ---------------------- | ---------------------- |
| `mount`     | エンジン初期化時       | GPU 設定とリソース準備 |
| `clean`     | エンジン終了時         | リソースの解放         |
| `resize`    | キャンバスサイズ変更時 | 描画領域の再設定       |
| `mousemove` | マウス移動時           | インタラクティブ操作   |
| `loop`      | フレームごと           | アニメーション更新     |

### Event Registration

```javascript
// 初期化時の処理
gl('mount', () => {
        console.log('Engine initialized')
        gl.uniform('startTime', performance.now())
})

// クリーンアップ処理
gl('clean', () => {
        console.log('Resources cleaned')
})

// カスタムイベント
gl('customEvent', (data) => {
        gl.uniform('customData', data)
})
```

### Event Flow

```
Application Start
        │
    ┌───▼───┐
    │ mount │ ─────► GPU Context Creation
    └───┬───┘       Resource Allocation
        │
    ┌───▼───┐
    │ resize│ ─────► Canvas Size Update
    └───┬───┘       Viewport Configuration
        │
    ┌───▼───┐
    │ loop  │ ─────► Animation Frame
    └───┬───┘       Uniform Updates
        │           Render Execution
        │
    Application End
        │
    ┌───▼───┐
    │ clean │ ─────► Resource Cleanup
    └───────┘       Context Destruction
```

## Resource Management

### Uniform Variables

CPU 側の値を GPU 側に効率的に転送するシステム：

| Method                   | Parameters              | Description             |
| ------------------------ | ----------------------- | ----------------------- |
| `gl.uniform(key, value)` | `string, number\|array` | Uniform 変数の設定      |
| `gl.uniform(object)`     | `object`                | 複数 Uniform の一括設定 |

```javascript
// スカラー値
gl.uniform('iTime', performance.now() / 1000)

// ベクトル値
gl.uniform('iResolution', [800, 600])
gl.uniform('color', [1.0, 0.5, 0.2, 1.0])

// マトリクス
gl.uniform('transform', [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])

// 一括設定
gl.uniform({
        iTime: time,
        iMouse: [mouseX, mouseY],
        amplitude: 2.0,
})
```

### Attribute Data

頂点属性データの管理：

| Method                             | Parameters                   | Description          |
| ---------------------------------- | ---------------------------- | -------------------- |
| `gl.attribute(key, data)`          | `string, number[]`           | 属性データの設定     |
| `gl.attribute(key, data, indices)` | `string, number[], number[]` | インデックス付き属性 |

```javascript
// 基本的な三角形
gl.attribute('position', [0.0, 0.5, -0.5, -0.5, 0.5, -0.5])

// 色付き頂点
gl.attribute('color', [
        1.0,
        0.0,
        0.0,
        1.0, // 赤
        0.0,
        1.0,
        0.0,
        1.0, // 緑
        0.0,
        0.0,
        1.0,
        1.0, // 青
])

// インデックス付きジオメトリ
gl.attribute('position', quadVertices, [0, 1, 2, 2, 3, 0])
```

### Texture Resources

画像リソースの GPU メモリ管理：

| Method                    | Parameters                  | Description          |
| ------------------------- | --------------------------- | -------------------- |
| `gl.texture(key, source)` | `string, string\|ImageData` | テクスチャの読み込み |

```javascript
// URL からの読み込み
gl.texture('mainTexture', './assets/image.jpg')

// ユーザー画像の利用
gl.texture('userImage', imageElement)

// データURLからの読み込み
gl.texture('proceduralTexture', canvas.toDataURL())
```

## Lifecycle Management

### Initialization Sequence

```
createGL() Call
      │
  ┌───▼───┐
  │Config │ ──── Default Values
  │ Setup │      User Overrides
  └───┬───┘
      │
  ┌───▼───┐
  │Queue  │ ──── Event Queue
  │ Init  │      Frame Manager
  └───┬───┘
      │
  ┌───▼───┐
  │Mount  │ ──── GPU Context
  │ Event │      Shader Compilation
  └───┬───┘      Resource Binding
      │
  ┌───▼───┐
  │Loop   │ ──── Animation Start
  │ Start │      Reactive Updates
  └───────┘
```

### Resource Cleanup

```javascript
// 明示的なクリーンアップ
gl.clean()

// 自動クリーンアップの設定
window.addEventListener('beforeunload', () => {
        gl.clean()
})

// リサイズイベントでの再初期化
window.addEventListener('resize', () => {
        gl.resize()
})
```

## Debug and Monitoring

### Development Tools

```javascript
// デバッグ情報の有効化
const gl = createGL({
        debug: true,
        verbose: true,
})

// パフォーマンス監視
gl('loop', () => {
        const frameTime = performance.now()
        console.log(`Frame time: ${frameTime}ms`)
})

// エラーハンドリング
gl('error', (error) => {
        console.error('GLRE Error:', error)
})
```

GLRE のコアエンジンは、これらの機能を組み合わせることで、複雑な GPU プログラミングを簡潔で直感的な API として提供します。
