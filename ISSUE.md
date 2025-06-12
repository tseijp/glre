# WebGPU実装の問題分析と解決プラン

## 問題の概要

`useGL({ isWebGL: false })` でWebGPU実装をテストした際、以下の問題が発生:

1. **頂点属性検証エラー**: `Vertex attribute slot 0 used in shader is not present in the VertexState`
2. **描画失敗**: エラーは修正されたが画面が真っ暗（黒画面）
3. **シェーダー受け渡し問題**: vertex/fragment間の適切なデータ渡しができていない

## 根本原因分析

### 1. 頂点バッファーレイアウト設定の不備

現在の `createRenderPipeline` では以下の問題:

```typescript
// 現在の実装（/packages/core/src/utils/pipeline.ts:44-65）
vertex: {
    module: vertexModule,
    entryPoint: 'vs_main',
    buffers: [{
        arrayStride: 8, // vec2f = 8 bytes
        attributes: [{
            format: 'float32x2',
            offset: 0,
            shaderLocation: 0, // @location(0)に対応
        }],
    }],
}
```

問題点:
- 頂点バッファーレイアウトは定義されているが、実際の描画時に頂点バッファーがバインドされていない
- `webgpu.ts`の`render`関数でvertexBufferの設定が不完全

### 2. 頂点バッファーバインドの欠如

`/packages/core/src/webgpu.ts:38-57` の描画処理:

```typescript
gl('render', () => {
    // ...
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bindGroup)
    // 頂点バッファーのバインドが欠如
    // pass.setVertexBuffer(0, vertexBuffer) ← 実行されていない
    pass.end()
    device.queue.submit([encoder.finish()])
})
```

### 3. シェーダーとの整合性問題

デフォルトシェーダー（`/packages/core/src/utils/pipeline.ts:19-34`）:

```wgsl
@vertex
fn vs_main(@location(0) position: vec2f) -> @builtin(position) vec4f {
  return vec4f(position, 0.0, 1.0);
}
```

この実装では:
- `a_position`データが適切に渡されていない
- `index.ts:22`の`[-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]`データが活用されていない

## 解決プラン

### Phase 1: 頂点バッファー管理の修正

1. **頂点バッファー追跡システム**
   - `webgpu.ts`に頂点バッファー管理機能を追加
   - `_attribute`コールバック内で`a_position`を適切に保存

2. **描画時の頂点バッファーバインド**
   - `render`関数内で`pass.setVertexBuffer(0, vertexBuffer)`を実装
   - `pass.draw(vertexCount)`で正しい頂点数を指定

### Phase 2: データフロー整合性確保

1. **attribute関数の修正**
   - `gl.attribute({ a_position })`が呼ばれた時の処理改善
   - 頂点データを適切にバッファーに書き込み、描画用に保存

2. **uniform関数の統合**
   - `iResolution`等のuniformが適切にシェーダーに渡されることを確認
   - バインドグループの更新タイミング調整

### Phase 3: デバッグ・検証機能

1. **WebGPUバリデーション活用**
   - デバイス作成時のvalidation有効化
   - シェーダーコンパイルエラーのハンドリング

2. **ログ出力強化**
   - 各ステップの成功/失敗状況を確認できる仕組み

## 実装詳細

### 修正対象ファイル

1. `/packages/core/src/webgpu.ts`
   - 頂点バッファー保存変数の追加
   - `render`関数内の頂点バッファーバインド実装

2. `/packages/core/src/utils/pipeline.ts`
   - 必要に応じてシェーダーやパイプライン設定の調整

### 実装手順

1. `webgpu.ts`に`vertexBuffer`変数を追加
2. `_attribute`でバッファー作成と保存を実装
3. `render`で`setVertexBuffer`と`draw`を適切に実行
4. 動作確認とデバッグ

## 期待される結果

修正後は以下が実現される:
- `useGL({ isWebGL: false })`でWebGPU描画が正常動作
- デフォルトシェーダーによる矩形描画表示
- WebGL実装との対称性確保
- uniform/attribute機能の正常動作