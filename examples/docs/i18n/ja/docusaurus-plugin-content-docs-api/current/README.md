# GLRE API Documentation

## Overview

GLRE は、JavaScript/TypeScript から WebGL2 と WebGPU を統一的に操作するリアクティブ GPU エンジンです。シンプルな API で高度なグラフィックス処理を実現し、複雑な GPU プログラミングを抽象化します。

## Quick Start

```javascript
import { createGL, vec4, fract, position, iResolution } from 'glre'

const gl = createGL({
        fragment: vec4(fract(position.xy.div(iResolution)), 0, 1),
})
gl.mount()
```

## API Structure

GLRE の API は 3 つの主要な領域に分かれています：

### Core Engine

GLRE の中核となるエンジン機能とイベントシステム

| Component         | Description              | Usage                         |
| ----------------- | ------------------------ | ----------------------------- |
| **createGL**      | メインエンジンの初期化   | `createGL(config)`            |
| **Event System**  | リアクティブイベント処理 | `gl('mount', callback)`       |
| **Configuration** | エンジンの設定管理       | `{ isWebGL: true, count: 6 }` |

### Node System

TypeScript でシェーダーコードを記述する DSL

| Category      | Functions                         | Purpose        |
| ------------- | --------------------------------- | -------------- |
| **Types**     | `vec2`, `vec3`, `vec4`, `mat4`    | データ型の生成 |
| **Math**      | `sin`, `cos`, `mix`, `step`       | 数学関数       |
| **Variables** | `uniform`, `attribute`, `builtin` | データ入力     |

### Reference

実際の開発で使用される全関数のリファレンス

| Section       | Content                    | Coverage                      |
| ------------- | -------------------------- | ----------------------------- |
| **Functions** | 全数学関数とユーティリティ | 150+ functions                |
| **Types**     | 型システムと変換メソッド   | Vector, Matrix, Scalar        |
| **Operators** | 演算子とメソッドチェーン   | Arithmetic, Logic, Comparison |

## Engine Architecture

```
    JavaScript Application
           │
    ┌──────▼──────┐
    │   GLRE API  │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ Event Queue │ ◄─── Reactive Updates
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │   Backend   │
    │ WebGL/WebGPU│
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │     GPU     │
    └─────────────┘
```

## Basic Concepts

### Reactive Programming

GLRE はリアクティブプログラミングモデルを採用しています。値の変更は自動的に GPU に伝播され、手動での更新処理は不要です。

### Uniform Variables

CPU 側から GPU 側にデータを送信するための仕組み：

```javascript
gl.uniform('iTime', performance.now() / 1000)
gl.uniform('iResolution', [width, height])
```

### Attribute Data

頂点データを管理するシステム：

```javascript
gl.attribute('position', [0, 0.5, -0.5, -0.5, 0.5, -0.5])
```

### Texture Resources

画像データを GPU で利用するための機能：

```javascript
gl.texture('mainTexture', './image.jpg')
```

## Node System Basics

TypeScript の構文でシェーダーコードを記述できる独自 DSL：

```javascript
// 基本的な型生成
const position = vec3(0, 0, 0)
const color = vec4(1, 0, 0, 1)

// 数学演算
const result = position.mul(2).add(vec3(1))

// 条件分岐
If(value.greaterThan(0.5), () => {
        return vec3(1, 0, 0)
}).Else(() => {
        return vec3(0, 0, 1)
})
```

## Common Patterns

### Fragment Shader Creation

```javascript
const fragmentShader = vec4(fract(position.xy.div(iResolution)), 0, 1)
```

### Vertex Transformation

```javascript
const vertexShader = vec4(attribute('position').mul(uniform('scale')), 0, 1)
```

### Animation Loop

```javascript
const animated = sin(uniform('iTime').mul(2)).mul(0.5).add(0.5)
```

## Performance Considerations

GLRE は自動的に以下の最適化を実行します：

- Uniform/Attribute の重複管理の回避
- 不要な再コンパイルの防止
- メモリ使用量の最適化
- リアクティブ更新の効率化

これらの最適化により、開発者は低レベルな詳細を気にすることなく、創造的な作業に集中できます。

## Next Steps

より詳細な情報については、以下のセクションを参照してください：

- **Core**: エンジンの基本機能とイベントシステム
- **Node System**: TypeScript DSL の完全なリファレンス
- **Reference**: 全関数と API の詳細仕様
