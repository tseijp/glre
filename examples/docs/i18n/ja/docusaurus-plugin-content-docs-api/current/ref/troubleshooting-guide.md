# Troubleshooting Guide

## 一般的な問題と解決方法

### シェーダーコンパイルエラー

#### GLSL コンパイルエラー

| エラータイプ   | 症状                                   | 解決方法                               |
| -------------- | -------------------------------------- | -------------------------------------- |
| **型不一致**   | `Cannot convert from 'int' to 'float'` | 明示的な型変換を追加 `float(intValue)` |
| **未定義変数** | `Undeclared identifier 'varName'`      | uniform/attribute の宣言を確認         |
| **構文エラー** | `Syntax error at line X`               | セミコロン、括弧の不一致を確認         |
| **精度修飾子** | `No precision specified`               | `precision mediump float;` を追加      |

```javascript
// 悪い例
const badShader = `
#version 300 es
in vec3 position;
uniform time; // 型が未指定
void main() {
    gl_Position = vec4(position + time, 1.0); // 型不一致
}
`

// 良い例
const goodShader = `
#version 300 es
precision mediump float;
in vec3 position;
uniform float time;
void main() {
    gl_Position = vec4(position + vec3(time), 1.0);
}
`
```

#### WGSL コンパイルエラー

| エラータイプ             | 症状                       | 解決方法                           |
| ------------------------ | -------------------------- | ---------------------------------- |
| **バインディング重複**   | `Binding X already used`   | group/binding 番号の重複を確認     |
| **ワークグループサイズ** | `Invalid workgroup size`   | `@workgroup_size(8, 8)` 制限を確認 |
| **ステージ属性**         | `Missing stage attribute`  | `@vertex`, `@fragment` を追加      |
| **型注釈**               | `Type annotation required` | 明示的な型指定 `var x: f32`        |

```javascript
// WGSL エラー修正例
const fixedWGSL = `
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var textureSampler: sampler;
@group(0) @binding(2) var colorTexture: texture_2d<f32>;

@fragment
fn main(@location(0) uv: vec2f) -> @location(0) vec4f {
    return textureSample(colorTexture, textureSampler, uv);
}
`
```

### Node System の問題

#### 型推論エラー

```javascript
// 問題: 型が推論できない
const problematic = someValue.add(unknownType)

// 解決: 明示的な型変換
const fixed = someValue.add(unknownType.toFloat())

// または型チェック付きのヘルパー
const safeAdd = (a, b) => {
        const aTyped = a.type ? a : float(a)
        const bTyped = b.type ? b : float(b)
        return aTyped.add(bTyped)
}
```

#### スコープエラー

```javascript
// 問題: スコープ外での変数参照
let outsideVar
If(condition, () => {
        outsideVar = vec3(1, 0, 0) // エラー: スコープ外への代入
})

// 解決: 適切なスコープ管理
const result = If(condition, () => {
        return vec3(1, 0, 0)
}).Else(() => {
        return vec3(0, 0, 1)
})
```

#### メソッドチェーンエラー

```javascript
// 問題: 未定義メソッドの呼び出し
const invalid = position.invalidMethod().mul(2)

// 解決: 有効なメソッドの確認
const valid = position.normalize().mul(2)

// デバッグ用のメソッド存在チェック
const debugChain = (node, methodName) => {
        if (typeof node[methodName] !== 'function') {
                console.error(`Method ${methodName} not available on`, node)
                return node
        }
        return node[methodName]()
}
```

## プラットフォーム固有の問題

### WebGL 問題

#### 拡張機能の対応

```javascript
// WebGL 拡張機能チェック
const checkWebGLExtensions = (gl) => {
        const required = ['OES_texture_float', 'WEBGL_depth_texture', 'EXT_color_buffer_float']

        const missing = required.filter((ext) => !gl.getExtension(ext))

        if (missing.length > 0) {
                console.warn('Missing WebGL extensions:', missing)
                return false
        }

        return true
}

// フォールバック実装
const createWithFallback = (config) => {
        try {
                return createGL(config)
        } catch (error) {
                console.warn('WebGL creation failed:', error)
                // より互換性の高い設定にフォールバック
                return createGL({
                        ...config,
                        antialias: false,
                        alpha: false,
                })
        }
}
```

#### コンテキストロス対応

```javascript
// WebGL コンテキストロスの処理
const handleContextLoss = (canvas, gl) => {
        canvas.addEventListener('webglcontextlost', (event) => {
                event.preventDefault()
                console.warn('WebGL context lost')
                gl.isLoop = false
        })

        canvas.addEventListener('webglcontextrestored', () => {
                console.log('WebGL context restored')
                gl('mount') // 再初期化
                gl.isLoop = true
        })
}
```

### WebGPU 問題

#### アダプター取得失敗

```javascript
// WebGPU アダプター問題の診断
const diagnoseWebGPU = async () => {
        if (!navigator.gpu) {
                return 'WebGPU not supported in this browser'
        }

        try {
                const adapter = await navigator.gpu.requestAdapter()
                if (!adapter) {
                        return 'No suitable WebGPU adapter found'
                }

                const device = await adapter.requestDevice()
                return 'WebGPU available'
        } catch (error) {
                return `WebGPU error: ${error.message}`
        }
}

// 使用例
diagnoseWebGPU().then((result) => {
        console.log('WebGPU status:', result)
})
```

#### デバイス制限チェック

```javascript
// WebGPU デバイス制限の確認
const checkWebGPULimits = (device) => {
        const limits = device.limits

        console.log('WebGPU Limits:', {
                maxTextureDimension2D: limits.maxTextureDimension2D,
                maxBindGroups: limits.maxBindGroups,
                maxUniformBufferBindingSize: limits.maxUniformBufferBindingSize,
                maxStorageBufferBindingSize: limits.maxStorageBufferBindingSize,
        })

        // 制限チェック例
        if (limits.maxTextureDimension2D < 4096) {
                console.warn('Large textures may not be supported')
        }
}
```

## パフォーマンス問題

### フレームレート低下

#### GPU プロファイリング

```javascript
// パフォーマンス測定
const createPerformanceMonitor = () => {
        let frameCount = 0
        let lastTime = performance.now()
        let gpuTime = 0

        return {
                frame() {
                        frameCount++
                        const currentTime = performance.now()

                        if (currentTime - lastTime >= 1000) {
                                const fps = (frameCount * 1000) / (currentTime - lastTime)
                                const avgGpuTime = gpuTime / frameCount

                                console.log(`FPS: ${fps.toFixed(1)}, GPU: ${avgGpuTime.toFixed(2)}ms`)

                                frameCount = 0
                                gpuTime = 0
                                lastTime = currentTime
                        }
                },

                addGpuTime(time) {
                        gpuTime += time
                },
        }
}

// 使用例
const monitor = createPerformanceMonitor()
gl('loop', () => {
        monitor.frame()
})
```

#### 描画呼び出し最適化

```javascript
// 描画呼び出し数の監視
const drawCallMonitor = {
        count: 0,
        reset() {
                this.count = 0
        },
        increment() {
                this.count++
        },
        report() {
                console.log(`Draw calls this frame: ${this.count}`)
                this.reset()
        },
}

// バッチング最適化
const optimizeBatching = (objects) => {
        // マテリアル別にソート
        const batches = new Map()

        objects.forEach((obj) => {
                const key = `${obj.material.shader}-${obj.material.texture}`
                if (!batches.has(key)) {
                        batches.set(key, [])
                }
                batches.get(key).push(obj)
        })

        return Array.from(batches.values())
}
```

### メモリ使用量

#### メモリリーク検出

```javascript
// WebGL メモリリーク検出
const trackGLResources = (gl) => {
        const resources = {
                textures: new Set(),
                buffers: new Set(),
                programs: new Set(),
        }

        // リソース作成の追跡
        const originalCreateTexture = gl.createTexture
        gl.createTexture = function () {
                const texture = originalCreateTexture.call(this)
                resources.textures.add(texture)
                return texture
        }

        // 解放の追跡
        const originalDeleteTexture = gl.deleteTexture
        gl.deleteTexture = function (texture) {
                resources.textures.delete(texture)
                return originalDeleteTexture.call(this, texture)
        }

        return {
                getResourceCount() {
                        return {
                                textures: resources.textures.size,
                                buffers: resources.buffers.size,
                                programs: resources.programs.size,
                        }
                },
        }
}
```

#### ガベージコレクション対策

```javascript
// オブジェクトプールパターン
const createObjectPool = (createFn, resetFn, initialSize = 10) => {
        const pool = []
        const active = new Set()

        // 初期プール作成
        for (let i = 0; i < initialSize; i++) {
                pool.push(createFn())
        }

        return {
                acquire() {
                        const obj = pool.pop() || createFn()
                        active.add(obj)
                        return obj
                },

                release(obj) {
                        if (active.has(obj)) {
                                active.delete(obj)
                                resetFn(obj)
                                pool.push(obj)
                        }
                },

                stats() {
                        return {
                                pooled: pool.length,
                                active: active.size,
                        }
                },
        }
}

// vec3 プールの例
const vec3Pool = createObjectPool(
        () => ({ x: 0, y: 0, z: 0 }),
        (v) => {
                v.x = v.y = v.z = 0
        }
)
```

## デバッグ技法

### Visual デバッグ

```javascript
// カラーコーディングデバッグ
const debugColors = {
        red: vec3(1, 0, 0),
        green: vec3(0, 1, 0),
        blue: vec3(0, 0, 1),
        yellow: vec3(1, 1, 0),
        magenta: vec3(1, 0, 1),
        cyan: vec3(0, 1, 1),
}

const visualDebug = Fn(([value, mode]) => {
        return Switch(mode)
                .Case(0, () => debugColors.red) // エラー
                .Case(1, () => debugColors.green) // 正常
                .Case(2, () => debugColors.blue) // 情報
                .Case(3, () => value.xxx) // X成分のみ
                .Case(4, () => value.yyy) // Y成分のみ
                .Case(5, () => value.zzz) // Z成分のみ
                .Default(() => debugColors.magenta) // 未定義
})
```

### ステップ実行デバッグ

```javascript
// シェーダーデバッグ用のステップ実行
const debugStep = (condition, value, debugValue) => {
        return select(condition, debugValue, value)
}

// 使用例
const shader = () => {
        const normalColor = calculateLighting()
        const debugMode = uniform('debugMode')

        // デバッグステップ
        const step1 = debugStep(debugMode.equal(1), normalColor, vec3(1, 0, 0))
        const step2 = debugStep(debugMode.equal(2), step1, vec3(0, 1, 0))

        return vec4(step2, 1.0)
}
```

### ログ出力

```javascript
// シェーダー値のCPUログ出力
const logShaderValue = (name, value) => {
        // フィードバックバッファを使用（WebGPU）
        if (gl.isWebGPU) {
                gl.feedback(name, value, (result) => {
                        console.log(`${name}:`, result)
                })
        } else {
                // WebGL: テクスチャ読み出し
                gl.readPixel(name, value, (result) => {
                        console.log(`${name}:`, result)
                })
        }
}
```

## 環境固有の問題

### ブラウザ互換性

```javascript
// ブラウザ機能検出
const detectCapabilities = () => {
        const capabilities = {
                webgl2: !!document.createElement('canvas').getContext('webgl2'),
                webgpu: !!navigator.gpu,
                sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
                offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
        }

        console.log('Browser capabilities:', capabilities)
        return capabilities
}

// 機能に応じた設定
const createOptimalConfig = (capabilities) => {
        return {
                isWebGL: !capabilities.webgpu,
                useOffscreenCanvas: capabilities.offscreenCanvas,
                enableSharedBuffers: capabilities.sharedArrayBuffer,
        }
}
```

### モバイル最適化

```javascript
// モバイル端末での制限対応
const mobileOptimizations = {
        // テクスチャサイズ制限
        getMaxTextureSize() {
                const canvas = document.createElement('canvas')
                const gl = canvas.getContext('webgl2')
                return gl.getParameter(gl.MAX_TEXTURE_SIZE)
        },

        // 精度制限チェック
        checkPrecision(gl) {
                const vertexPrecision = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT)
                const fragmentPrecision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)

                return {
                        vertex: vertexPrecision.precision > 0,
                        fragment: fragmentPrecision.precision > 0,
                }
        },

        // メモリ制限対応
        estimateMemoryUsage(width, height, format) {
                const bytesPerPixel = {
                        rgba8: 4,
                        rgba16f: 8,
                        rgba32f: 16,
                }

                return width * height * (bytesPerPixel[format] || 4)
        },
}
```

## トラブルシューティングチェックリスト

### 基本チェック項目

- [ ] WebGL2/WebGPU サポートの確認
- [ ] 必要な拡張機能の有効性
- [ ] シェーダーコンパイルエラーの確認
- [ ] Uniform/Attribute の名前一致
- [ ] テクスチャ形式とサイズの制限
- [ ] デバイスメモリ使用量
- [ ] ブラウザコンソールエラー

### パフォーマンスチェック

- [ ] フレームレート測定
- [ ] 描画呼び出し数の最適化
- [ ] GPU メモリ使用量
- [ ] テクスチャ解像度の適正化
- [ ] シェーダー複雑度の評価

### 互換性チェック

- [ ] 複数ブラウザでのテスト
- [ ] モバイル端末での動作確認
- [ ] 古いデバイスでの性能評価
- [ ] 異なる GPU での検証

GLRE のトラブルシューティングは、体系的なアプローチと適切なツールの使用により、効率的に問題を特定し解決することができます。
