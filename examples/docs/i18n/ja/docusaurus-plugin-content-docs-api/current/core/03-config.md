# Configuration System

## Basic Configuration

GLRE エンジンの動作をカスタマイズするための設定オプションです。

### Core Settings

| Option     | Type      | Default              | Description              |
| ---------- | --------- | -------------------- | ------------------------ |
| `isWebGL`  | `boolean` | `true`               | WebGL2/WebGPU の選択     |
| `isLoop`   | `boolean` | `true`               | 自動アニメーションループ |
| `isNative` | `boolean` | `false`              | React Native 環境フラグ  |
| `count`    | `number`  | `6`                  | 描画プリミティブ数       |
| `width`    | `number`  | `window.innerWidth`  | キャンバス幅             |
| `height`   | `number`  | `window.innerHeight` | キャンバス高さ           |

### Shader Configuration

| Option     | Type           | Default         | Description            |
| ---------- | -------------- | --------------- | ---------------------- |
| `vertex`   | `string\|Node` | defaultVertex   | 頂点シェーダー         |
| `fragment` | `string\|Node` | defaultFragment | フラグメントシェーダー |
| `vs`       | `string\|Node` | -               | vertex の別名          |
| `fs`       | `string\|Node` | -               | fragment の別名        |
| `vert`     | `string\|Node` | -               | vertex の別名          |
| `frag`     | `string\|Node` | -               | fragment の別名        |

## Configuration Examples

### Basic Setup

```javascript
// 最小設定
const gl = createGL()

// 基本設定
const gl = createGL({
        width: 800,
        height: 600,
        isWebGL: true,
})
```

### Advanced Setup

```javascript
// カスタムシェーダー
const gl = createGL({
        isWebGL: false, // WebGPU使用
        count: 36, // キューブ描画
        vertex: `
        @vertex
        fn main(@location(0) pos: vec3f) -> @builtin(position) vec4f {
          return vec4f(pos, 1.0);
        }
      `,
        fragment: `
        @fragment
        fn main() -> @location(0) vec4f {
          return vec4f(1.0, 0.0, 0.0, 1.0);
        }
      `,
})
```

### Framework Integration

```javascript
// React統合
const gl = createGL({
        el: canvasRef.current,
        width: containerWidth,
        height: containerHeight,
        fragment: reactiveShader,
})

// React Native
const gl = createGL({
        isNative: true,
        isWebGL: true, // React NativeはWebGL必須
        count: triangleCount,
})
```

## Runtime Configuration

### Dynamic Settings

```javascript
// 実行時設定の変更
gl.isLoop = false // アニメーション停止
gl.count = 12 // 描画数変更
gl.size = [1024, 768] // サイズ変更

// シェーダーの動的変更
gl.fragment = newShader
gl('mount') // 再初期化
```

### Conditional Configuration

```javascript
// 条件付き設定
const config = {
        isWebGL: !navigator.gpu, // WebGPU未対応時はWebGL
        width: window.innerWidth,
        height: window.innerHeight,
        count: isMobile ? 3 : 6, // モバイルでは軽量化
}

const gl = createGL(config)
```

## Platform-Specific Settings

### WebGL2 Configuration

```javascript
const webglConfig = {
        isWebGL: true,
        webgl: {
                antialias: true,
                alpha: false,
                depth: true,
                stencil: false,
                premultipliedAlpha: false,
                preserveDrawingBuffer: false,
        },
}
```

### WebGPU Configuration

```javascript
const webgpuConfig = {
        isWebGL: false,
        webgpu: {
                powerPreference: 'high-performance',
                forceFallbackAdapter: false,
                label: 'GLRE Engine',
        },
}
```

## Default Configurations

### Default Vertex Shader

```javascript
// デフォルト頂点シェーダーの生成ロジック
const defaultVertex = () =>
        vec4(
                float(int(vertexIndex).mod(int(2)))
                        .mul(4)
                        .sub(1), // X座標: -1 または 3
                float(int(vertexIndex).div(int(2)))
                        .mul(4)
                        .sub(1), // Y座標: -1 または 3
                0,
                1 // Z=0, W=1
        )
```

### Default Fragment Shader

```javascript
// デフォルトフラグメントシェーダー
const defaultFragment = () => vec4(fract(position.xy.div(iResolution)), 0, 1)
```

## Configuration Validation

```
User Config Input
       │
   ┌───▼───┐
   │Merge  │ ──── Default Values
   │Config │      User Overrides
   └───┬───┘
       │
   ┌───▼───┐
   │Valid- │ ──── Type Checking
   │ation  │      Range Validation
   └───┬───┘      Platform Support
       │
   ┌───▼───┐
   │Final  │ ──── Normalized Config
   │Config │      Ready for Engine
   └───────┘
```

### Validation Rules

| Setting           | Validation   | Fallback        |
| ----------------- | ------------ | --------------- |
| `width/height`    | > 0          | `window.inner*` |
| `count`           | > 0, integer | `6`             |
| `isWebGL`         | boolean      | `true`          |
| `vertex/fragment` | string\|Node | default shaders |

## Environment-Specific Defaults

### Development Environment

```javascript
const devConfig = {
        debug: true,
        verbose: true,
        errorReporting: true,
        performanceMonitoring: true,
}
```

### Production Environment

```javascript
const prodConfig = {
        debug: false,
        verbose: false,
        errorReporting: false,
        performanceMonitoring: false,
}
```

### Mobile Optimization

```javascript
const mobileConfig = {
        count: 3, // 軽量ジオメトリ
        width: Math.min(800, window.innerWidth),
        height: Math.min(600, window.innerHeight),
        isWebGL: true, // WebGPU未対応端末対応
        antialias: false, // パフォーマンス優先
}
```

## Configuration Merging

### Priority Order

```
1. User Provided Config
2. Environment Defaults
3. Platform Defaults
4. Global Defaults
```

### Merge Strategy

```javascript
const finalConfig = {
        // Global defaults
        ...globalDefaults,

        // Platform-specific defaults
        ...(isWebGPUSupported() ? webgpuDefaults : webglDefaults),

        // Environment defaults
        ...(isDevelopment ? devDefaults : prodDefaults),

        // User config (highest priority)
        ...userConfig,
}
```

## Configuration Best Practices

### Performance Optimization

```javascript
// 高パフォーマンス設定
const performanceConfig = {
        isWebGL: false, // WebGPU使用
        antialias: false, // アンチエイリアス無効
        alpha: false, // アルファチャンネル無効
        depth: false, // 深度バッファ無効（2Dの場合）
        preserveDrawingBuffer: false,
}
```

### Quality Priority

```javascript
// 高品質設定
const qualityConfig = {
        antialias: true,
        alpha: true,
        depth: true,
        stencil: true,
        powerPreference: 'high-performance',
}
```

### Cross-Platform Compatibility

```javascript
// 互換性重視設定
const compatConfig = {
        isWebGL: true, // 最大互換性
        fallbackShaders: true, // フォールバックシェーダー
        errorRecovery: true, // エラー回復機能
}
```

GLRE の設定システムは、多様な環境とユースケースに対応しながら、開発者にとって直感的で柔軟な設定体験を提供します。
