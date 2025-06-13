# WebGL1 から WebGL2 への移行調査結果

## 調査対象
- .search/tsl/README.md (Three.js TSL関連)
- ./README.md (glreライブラリ概要)
- packages/core/src/index.ts (メインエントリポイント)
- packages/core/src/webgl.ts (WebGL実装)
- packages/core/src/utils/webgpu.ts (存在せず)

## 主要な変更点

### 1. GLSLバージョンと構文変更

#### WebGL1 (GLSL 100 ES)
```glsl
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}
```

#### WebGL2 (GLSL 300 ES)
```glsl
#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}
```

### 2. gl_VertexIDを使用したattributeフリー実装

#### 基本概念
- WebGL2では`gl_VertexID`変数が利用可能
- 頂点インデックスから直接頂点位置を計算可能
- バッファなしでジオメトリ生成が可能

#### フルスクリーン三角形の実装例
```glsl
#version 300 es
out vec2 v_texCoord;

void main() {
    vec2 position = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    v_texCoord = position;
    gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}
```

#### 二つの三角形による平面の実装
```glsl
#version 300 es
void main() {
    float x = float(gl_VertexID % 2) * 2.0 - 1.0;
    float y = float(gl_VertexID / 2) * 2.0 - 1.0;
    gl_Position = vec4(x, y, 0.0, 1.0);
}
```

### 3. glreライブラリの現在の実装

#### a_positionのデフォルト値
```ts
const a_position = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]
```
- 6頂点で2つの三角形を形成
- フルスクリーンクワッドを表現

#### WebGL初期化処理
```ts
if (gl.count === 6) gl.attribute({ a_position })
```

### 4. 実装要件

#### デフォルトvertexシェーダーの変更
現在:
```ts
export const defaultVertexGLSL = /* cpp */ `
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}
`
```

変更後:
```ts
export const defaultVertexGLSL = /* cpp */ `
#version 300 es
void main() {
  float x = float(gl_VertexID % 2) * 4.0 - 1.0;
  float y = float(gl_VertexID / 2) * 4.0 - 1.0;
  gl_Position = vec4(x, y, 0.0, 1.0);
}
`
```

#### 必要な変更箇所
1. packages/core/src/webgl.ts - シェーダー生成ロジック
2. packages/core/src/code/glsl.ts - デフォルトシェーダー定義
3. packages/core/src/index.ts - attribute設定ロジック（条件分岐追加）

### 5. Three.js TSLとの比較

#### TSLの特徴
- TypeScriptライクな構文でシェーダー記述
- WebGLとWebGPU両対応
- ノードベースのシェーダー抽象化
- 自動最適化機能

#### glreとの違い
- glre: 軽量なWebGLライブラリ、最小限の機能
- TSL: Three.js内の包括的なシェーダー言語システム
- glreはよりシンプルな実装でWebGL2対応が可能

### 6. WebGPU対応の準備

#### 現在の実装
- webgpu.ts ファイルは存在
- isWebGPUSupported() 関数で対応判定
- WebGPU利用時の分岐処理は実装済み

#### 今後の拡張
- TSL類似のノードシステム実装可能
- WebGLとWebGPU共通のシェーダー抽象化

## 実装の優先度
1. **高**: デフォルトvertexシェーダーのgl_VertexID対応
2. **中**: WebGL2の#version 300 es対応
3. **低**: その他のWebGL2新機能活用