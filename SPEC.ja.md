> # GLRE ノードシステム仕様書
>
> glre ノードシステムの包括的仕様書。Three.js Shading Language (TSL) との互換性を目指した設計分析と実装ガイド。
>
> ## 目次
>
> 1. [概要](#概要)
> 2. [現在の実装分析](#現在の実装分析)
> 3. [Three.js TSL 機能セット](#threejs-tsl機能セット)
> 4. [不足機能の差分分析](#不足機能の差分分析)
> 5. [アーキテクチャ](#アーキテクチャ)
> 6. [型システム](#型システム)
> 7. [ノードシステム API](#ノードシステムapi)
> 8. [制御フロー](#制御フロー)
> 9. [スコープ管理](#スコープ管理)
> 10. [数学関数](#数学関数)
> 11. [シェーダー生成](#シェーダー生成)
> 12. [実装優先度](#実装優先度)
>
> ## 概要
>
> glre ノードシステムは、JavaScript/TypeScript 構文でシェーダーを記述し、WebGL (GLSL) と WebGPU (WGSL) 対応のシェーダーコードを自動生成する TypeScript 基盤の抽象化レイヤー。
>
> ### 設計目標
>
> - **TypeScript-first**: TypeScript の型システムを活用したシェーダー開発
> - **クロスプラットフォーム**: 同一ソースから GLSL と WGSL の両方を生成
> - **開発者体験**: メソッドチェーンとスウィズリングによる直感的 API
> - **パフォーマンス**: ランタイムオーバーヘッドを最小化し、生成シェーダーを最適化
> - **TSL 互換性**: Three.js Shading Language 概念との互換性維持

メソッドチェーンとスウィズリングは開発済みです
パフォーマンスは必要ありません。

> ## 現在の実装分析
>
> 既存コードベース分析による現在の実装：
>
> ### ✅ 実装済み機能
>
> 1. **基本型システム**
>
>       - スカラー型: `float`, `int`, `uint`, `bool`
>       - ベクトル型: `vec2`, `vec3`, `vec4`, `ivec2-4`, `uvec2-4`, `bvec2-4`
>       - 行列型: `mat2`, `mat3`, `mat4`
>
> 2. **基本演算**
>
>       - 算術演算子: `add`, `sub`, `mul`, `div`, `mod`
>       - 比較演算子: `equal`, `notEqual`, `lessThan`, `greaterThan` 等
>       - 論理演算子: `and`, `or`, `not`
>       - ビット演算子: `bitAnd`, `bitOr`, `bitXor`, `shiftLeft`, `shiftRight`
>
> 3. **ベクトル操作**
>
>       - スウィズリング: `.x`, `.xy`, `.xyz`, `.rgba` 等
>       - スウィズル代入: `vector.y = value`
>
> 4. **数学関数**
>
>       - 基本数学: `abs`, `sin`, `cos`, `sqrt`, `pow` 等
>       - ベクトル関数: `normalize`, `cross`, `dot`, `length`, `distance`
>       - 補間: `mix`, `smoothstep`, `clamp`
>
> 5. **変数管理**
>
>       - 変数宣言: `.toVar(name)`
>       - 代入: `.assign(value)`
>       - uniform 変数: `uniform(value)`
>
> 6. **制御フロー（基本）**
>
>       - 条件文: `If()`, `Else()`, `ElseIf()`
>       - ループ文: `Loop(count, callback)`
>       - 関数定義: `Fn(callback)`
>
> 7. **コード生成**
>       - 基本 GLSL/WGSL 出力
>       - 型推論とマッピング
>       - スコープ管理
>
> ### ❌ 不足・制限機能
>
> 1. **高度な関数システム**
>
>       - 関数パラメータ型指定なし
>       - 関数レイアウト仕様なし
>       - 関数キャッシュ/最適化なし
>       - 再帰関数サポートなし

関数パラメータ型指定はできていないです
関数レイアウトについてはなんのことかわかっていません
最適化は必要ありません（複数回関数が定義されてエラーになるのはダメそう）
再帰関数について、js から glsl に関数の文字列に変換しているだけだから対応必要かわからん

> 2. **拡張制御フロー**
>
>       - `Switch`/`Case`文なし
>       - ループ内`Break`/`Continue`なし
>       - 三項演算子（`select`）なし
>       - ループバリアント制限（範囲、条件）

Switch / Case は scope.ts の If や Loop と同様に実装できそう
Break / Continue は threejs 側にあるなら必要
三項演算子はむずそう（threejs 側にあるなら必要）
ループバリアント制限はなんのことかわからん

> 3. **高度な変数管理**
>
>       - `varying`宣言なし
>       - `vertexStage()`関数なし
>       - 定数（`toConst`）処理不備
>       - プロパティ宣言なし

varying はめっちゃむずそう
現状 fragment shader のみでしか test できていないので、vertex shader ができていない
toConst は threejs 側にあるなら必要、、、現状のシステムの構成を利用してできそうでないなら優先度低め

> 4. **ノードシステム機能**
>
>       - 数学関数のメソッドチェーンなし
>       - 自動最適化なし
>       - ノードキャッシュなし
>       - エラーハンドリング不備

メソッドチェーンは Proxy の getter に isFunction() で分岐できているので処理自体はできる
しかし NodeProxy 側で型定義していないのでつかえていなそう
自動最適化は必要ありません！！！
自動最適化は必要ありません！！！
自動最適化は必要ありません！！！
キャッシュは必要があればだが優先度低め
エラーハンドリングは必要ありません！！！
エラーハンドリングは必要ありません！！！
エラーハンドリングは必要ありません！！！

> 5. **TSL 固有機能**
>
>       - テクスチャ操作なし
>       - アトリビュート処理なし
>       - ビルトインシェーダー変数なし（position, normal 等）
>       - マテリアル統合なし
>       - ライティングモデルなし

attribute や texture を指定するための node が必要そう
ビルドインシェーダについて、glsl では gl_FragCoord なのに、wgsl だと position となる
NodeConfig.isWebGL の変数によって build 時に変数名を変えられるようにしたい

> 6. **シェーダー生成**
>       - uniform 処理制限
>       - 適切なシェーダー構造生成なし
>       - インクルードシステムなし
>       - 最適化パスなし

わりと適切にシェーダー構造生成できていそう
include は必要なさそう（typescript の import を使えばいいので）threejs も文字列で include を再現している
最適化は必要ありません！！！
最適化は必要ありません！！！
最適化は必要ありません！！！

> ## Three.js TSL 機能セット
>
> TSL ドキュメント分析による主要機能：
>
> ### TSL コア機能
>
> 1. **ShaderNode システム**
>
>       - メソッドチェーン対応ノードベースプロキシオブジェクト
>       - 自動型変換と推論
>       - 複数座標系スウィズリング（xyzw, rgba, stpq）
>
> 2. **関数システム**
>
>       - レイアウト仕様付き`Fn()`
>       - 関数キャッシュと最適化
>       - 分割代入パラメータ処理
>       - マテリアル/ジオメトリアクセス付き遅延関数
>
> 3. **型システム**
>
>       - 自動変換付き GLSL/WGSL 全型
>       - 型変換メソッドチェーン（`.toFloat()`, `.toVec3()`等）
>       - 自動型推論と昇格
>
> 4. **制御フロー**
>
>       - 適切なスコープ付き`If`/`ElseIf`/`Else`
>       - `Switch`/`Case`/`Default`文
>       - 様々な設定の`Loop`
>       - `select()`による三項演算
>
> 5. **変数管理**
>
>       - 更新イベント付き`uniform()`（`onFrameUpdate`, `onRenderUpdate`等）
>       - 頂点/フラグメント通信用`varying()`と`vertexStage()`
>       - 変数宣言用`.toVar()`と`.toConst()`
>       - プロパティ宣言
>
> 6. **数学関数**
>
>       - 包括的 GLSL 関数ライブラリ
>       - メソッドチェーンサポート（例：`value.abs().sin()`）
>       - ベクトル・行列演算
>
> 7. **シェーダー統合**
>       - ビルトイン変数：`positionLocal`, `normalView`, `uv()`等
>       - テクスチャ操作：`texture()`, `cubeTexture()`等
>       - アトリビュートアクセス：`attribute()`, `vertexColor()`
>       - マテリアルプロパティ統合

ビルドイン変数は glsl /wgsl のバランスや差分を見て組み込みたいです
texture 操作もできないと厳しそうですね、、、
アトリビュートや vertex shader は何も考えられていないですが、現状のシステムで最小限で実装可能であれば実装したい

> ## 不足機能の差分分析
>
> ### 高優先度不足機能
>
> 1. **高度な関数システム**
>
>       ```typescript
>       // 現在（制限）
>       const func = Fn((args) => {
>               /* ... */
>       })
>
>       // TSL風（不足）
>       const func = Fn(({ position, normal }) => {
>               /* ... */
>       })
>       const func = Fn().setLayout({
>               inputs: [{ name: 'position', type: 'vec3' }],
>               return: 'vec4',
>       })
>       ```

setLayout によって型定義するのが threejs であるのであればそのような機能が必要そう
漸近的型推論で解決できるのであれば、引数と返り値は infer して自動的に決定したい

> 2. **数学関数のメソッドチェーン**
>
>       ```typescript
>       // 現在
>       const result = normalize(abs(value))
>
>       // TSL風（不足）
>       const result = value.abs().normalize()
>       ```

めっソドチェーンは前に記述したが、機能はあるが type error になっている

> 3. **高度な制御フロー**
>
>       ```typescript
>       // Switch/Case不足
>       Switch(value)
>               .Case(0, () => {
>                       /* ... */
>               })
>               .Case(1, 2, () => {
>                       /* ... */
>               })
>               .Default(() => {
>                       /* ... */
>               })
>
>       // 三項演算子不足
>       const result = select(condition, valueTrue, valueFalse)
>       ```

これはないですね、、、

> 4. **varying と頂点ステージ**
>
>       ```typescript
>       // varying サポート不足
>       const vPos = varying(positionLocal)
>       const vNormal = vertexStage(normalLocal)
>       ```

uniform しか考えていなかったですが、uniform 自体もまだ未完成な状況です

> 5. **テクスチャ操作**
>       ```typescript
>       // テクスチャ関数不足
>       const texColor = texture(diffuseMap, uv())
>       const cubeColor = cubeTexture(envMap, reflectVector)
>       ```

texture は必ず実装したい
glsl は uniform で texture をいれればよかったが、 wgsl は group と binding の番号が異なるので難しそう
例：

```ts
# texture examples
const fs = `
@group(0) @binding(0) var<uniform> iResolution: vec2f;
@group(1) @binding(0) var textureSampler: sampler;
@group(1) @binding(1) var texture: texture_2d<f32>;
@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let uv = position.xy / iResolution;
  return textureSample(texture, textureSampler, uv);
}
`
export default function () {
        const gl = useGL({ fs, isWebGL: false })
        gl.texture('iTexture', 'https://avatars.githubusercontent.com/u/40712342')
        return <canvas ref={gl.ref} />
}
```

uniform の binding は gl.uniform が呼ばれた順で cpu から gpu に送られるため、その順番をそのままつかっている
iResolution / iMouse / iTime の順で uniform を送るような default の設定になっている
その他 user が uniform を buffer として使用したい場合、binding 0 ~ 2 はもうつかっているので 3 からになる
このように uniform を使用する際に binding の番号つけの機能が現状存在しないです

group は uniform が 0 / texture が 1 です
gl.texture がよばれるために、ふたつづつ binding 番号を割り当てています
wgsl は textureSampler も送る必要があり、それが 2 _ i, texture 自体は 2 _ i + 1 で 2 個ずつ送るように決定しています

> ### 中優先度不足機能
>
> 1. **ビルトインシェーダー変数**
>
>       ```typescript
>       // ビルトイン変数不足
>       const pos = positionLocal
>       const norm = normalView
>       const uvCoord = uv()
>       const screenPos = screenUV
>       ```
>
> 2. **uniform 更新イベント**
>
>       ```typescript
>       // uniformイベント不足
>       const time = uniform(0).onFrameUpdate(({ frame }) => frame.time)
>       const objPos = uniform(vec3()).onObjectUpdate(({ object }) => object.position)
>       ```
>
> 3. **高度な型変換**
>
>       ```typescript
>       // メソッドチェーン変換不足
>       const result = value.toVec3().toColor()
>       ```
>
> 4. **ループバリアント**
>       ```typescript
>       // 高度なループ設定不足
>       Loop({ start: int(0), end: int(10), type: 'int' }, ({ i }) => {})
>       Loop(condition, () => {}) // while風
>       ```

一旦必要ないです

> ### 低優先度不足機能
>
> 1. **アトリビュート処理**
>
>       ```typescript
>       const pos = attribute('position', 'vec3')
>       const color = vertexColor(0)
>       ```
>
> 2. **ブレンドモードと UV ユーティリティ**
>
>       ```typescript
>       const blended = blendScreen(colorA, colorB)
>       const rotated = rotateUV(uv(), angle)
>       ```
>
> 3. **マテリアル統合**
>       ```typescript
>       // マテリアルノード接続
>       material.colorNode = myColorFunction()
>       material.normalNode = myNormalFunction()
>       ```

attribute / varying はちょっと必要そう
utility や、three.js のような material は全く必要ないです

> ## アーキテクチャ
>
> ### ノード構造
>
> ```typescript
> interface Node {
>         type: NodeType
>         props: NodeProps
>         children?: Node[]
> }
>
> interface NodeProps {
>         id?: string
>         children?: Node[]
>         defaultValue?: any
>         layout?: FunctionLayout
> }
>
> type NodeType =
>         | 'uniform'
>         | 'variable'
>         | 'swizzle'
>         | 'operator'
>         | 'node_type'
>         | 'math_fun'
>         | 'declare'
>         | 'assign'
>         | 'fn'
>         | 'if'
>         | 'loop'
>         | 'scope'
>         | 'switch'
>         | 'varying'
>         | 'attribute'
>         | 'texture'
> ```

よさそう
NodeProps は React みたいな感じにしたい（React 大好きなので）

> ### プロキシベースノード実装
>
> ```typescript
> const node = (type: NodeType, props?: NodeProps, ...args: any[]) => {
>         return new Proxy(() => {}, {
>                 get(_, key) {
>                         // コアプロパティ処理
>                         if (key === 'type') return type
>                         if (key === 'props') return props
>
>                         // 演算処理
>                         if (isSwizzle(key)) return createSwizzle(key)
>                         if (isOperator(key)) return createOperator(key)
>                         if (isFunction(key)) return createFunction(key)
>                         if (isConversion(key)) return createConversion(key)
>
>                         // 変数演算処理
>                         if (key === 'toVar') return toVar
>                         if (key === 'assign') return assign
>                         if (key === 'toConst') return toConst
>                 },
>                 set(_, key, value) {
>                         // スウィズル代入処理
>                         if (isSwizzle(key)) {
>                                 createSwizzle(key).assign(value)
>                                 return true
>                         }
>                         return false
>                 },
>         })
> }
> ```

`toVar(x)` で実行が必要そう（.bind で問題なさそう）
現状のコードで動いている部分もあるので、変更する場合はよく考えること

> ## 型システム
>
> ### スカラー型
>
> ```typescript
> export const float = (x?: number) => node('node_type', null, 'float', x ?? 0)
> export const int = (x?: number) => node('node_type', null, 'int', x ?? 0)
> export const uint = (x?: number) => node('node_type', null, 'uint', x ?? 0)
> export const bool = (x?: boolean) => node('node_type', null, 'bool', x ?? false)
> ```
>
> ### ベクトル型
>
> ```typescript
> export const vec2 = (x?: any, y?: any) => node('node_type', null, 'vec2', x, y)
> export const vec3 = (x?: any, y?: any, z?: any) => node('node_type', null, 'vec3', x, y, z)
> export const vec4 = (x?: any, y?: any, z?: any, w?: any) => node('node_type', null, 'vec4', x, y, z, w)
>
> // 整数ベクトル
> export const ivec2 = (x?: any, y?: any) => node('node_type', null, 'ivec2', x, y)
> export const ivec3 = (x?: any, y?: any, z?: any) => node('node_type', null, 'ivec3', x, y, z)
> export const ivec4 = (x?: any, y?: any, z?: any, w?: any) => node('node_type', null, 'ivec4', x, y, z, w)
>
> // 符号なしベクトル
> export const uvec2 = (x?: any, y?: any) => node('node_type', null, 'uvec2', x, y)
> export const uvec3 = (x?: any, y?: any, z?: any) => node('node_type', null, 'uvec3', x, y, z)
> export const uvec4 = (x?: any, y?: any, z?: any, w?: any) => node('node_type', null, 'uvec4', x, y, z, w)
>
> // 真偽値ベクトル
> export const bvec2 = (x?: any, y?: any) => node('node_type', null, 'bvec2', x, y)
> export const bvec3 = (x?: any, y?: any, z?: any) => node('node_type', null, 'bvec3', x, y, z)
> export const bvec4 = (x?: any, y?: any, z?: any, w?: any) => node('node_type', null, 'bvec4', x, y, z, w)
> ```
>
> ## ノードシステム API
>
> ### メソッドチェーンサポート
>
> ```typescript
> // メソッドとしての数学関数
> interface NodeProxy {
>         // 既存演算子
>         add(x: any): NodeProxy
>         sub(x: any): NodeProxy
>         mul(x: any): NodeProxy
>         div(x: any): NodeProxy
>
>         // メソッドとしての数学関数
>         abs(): NodeProxy
>         sin(): NodeProxy
>         cos(): NodeProxy
>         sqrt(): NodeProxy
>         normalize(): NodeProxy
>         length(): NodeProxy
>
>         // メソッドとしての型変換
>         toFloat(): NodeProxy
>         toInt(): NodeProxy
>         toVec2(): NodeProxy
>         toVec3(): NodeProxy
>         toVec4(): NodeProxy
>         toColor(): NodeProxy
>
>         // ユーティリティメソッド
>         oneMinus(): NodeProxy
>         saturate(): NodeProxy
>         fract(): NodeProxy
> }
> ```

上記追加して

> ### メソッドチェーン実装
>
> ```typescript
> const addMethodChaining = (name: string, nodeElement: Function) => {
>         if (methodChainElements.has(name)) {
>                 console.warn(`メソッドチェーン '${name}' は既に存在します`)
>                 return
>         }
>         methodChainElements.set(name, nodeElement)
> }
>
> // 数学関数のメソッドチェーン登録
> addMethodChaining('abs', (node) => abs(node))
> addMethodChaining('sin', (node) => sin(node))
> addMethodChaining('cos', (node) => cos(node))
> addMethodChaining('normalize', (node) => normalize(node))
> addMethodChaining('length', (node) => length(node))
>
> // 型変換登録
> addMethodChaining('toFloat', (node) => float(node))
> addMethodChaining('toVec3', (node) => vec3(node))
> addMethodChaining('toColor', (node) => color(node))
> ```

エラーハンドリングは必要ありません
Proxy は getter として `if (isFunction(key)) return (...y: X[]) => f(key, x, ...y)` であります
addMethodChaining が必要かどうかよくかんがえること

> ## 制御フロー
>
> ### 拡張 If 文
>
> ```typescript
> export const If = (condition: any, callback: () => void) => {
>   const scope = node('scope')
>   scoped(scope, callback)
>   const ifNode = node('if', null, condition, scope)
>   addToScope(ifNode)
>
>   return {
>     ElseIf: (newCondition: any, elseIfCallback: () => void) => {
>       const elseIfScope = node('scope')
>       scoped(elseIfScope, elseIfCallback)
>       ifNode.props.children!.push(newCondition, elseIfScope)
>       return { ElseIf: /* ... */, Else: /* ... */ }
>     },
>     Else: (elseCallback: () => void) => {
>       const elseScope = node('scope')
>       scoped(elseScope, elseCallback)
>       ifNode.props.children!.push(elseScope)
>     }
>   }
> }
> ```

ElseIf や Else を返す時に、If の定義を使って再帰的に実装できたらいいですが、
scope の問題が複雑であり、実装がかなり複雑化しそうです
しかし、ElseIf を無限に続ける実装は必ず必要なので、こころして実装すること（一番優先度高め）

> ### Switch/Case 文
>
> ```typescript
> export const Switch = (value: any) => {
>   const switchNode = node('switch', null, value)
>   addToScope(switchNode)
>
>   return {
>     Case: (...values: any[]) => {
>       return (callback: () => void) => {
>         const caseScope = node('scope')
>         scoped(caseScope, callback)
>         switchNode.props.children!.push(node('case', null, values, caseScope))
>         return { Case: /* ... */, Default: /* ... */ }
>       }
>     },
>     Default: (callback: () => void) => {
>       const defaultScope = node('scope')
>       scoped(defaultScope, callback)
>       switchNode.props.children!.push(node('default', null, defaultScope))
>     }
>   }
> }
> ```
>
> ### 拡張ループシステム
>
> ```typescript
> interface LoopConfig {
>         start?: any
>         end?: any
>         type?: 'int' | 'uint' | 'float'
>         condition?: '<' | '<=' | '>' | '>='
> }
>
> export const Loop = (config: number | LoopConfig | any, callback?: (params: { i: NodeProxy }) => void) => {
>         if (typeof config === 'number') {
>                 // シンプルカウントループ
>                 return createSimpleLoop(config, callback)
>         } else if (typeof config === 'object' && 'start' in config) {
>                 // 設定付き高度なループ
>                 return createAdvancedLoop(config, callback)
>         } else {
>                 // 条件ベースループ（while風）
>                 return createConditionalLoop(config, callback)
>         }
> }
> ```

シンプルか高度かどうかは、condition を数値なのか複雑な条件なのかを文字列にしているだけなので、
同様の機構で実装できそうですので、createSimpleLoop 関数として分ける必要なさそう

> ### 三項演算
>
> ```typescript
> export const select = (condition: any, trueValue: any, falseValue: any) => {
>         return node('ternary', null, condition, trueValue, falseValue)
> }
> ```

よさそう：code.ts での実装が必要そう

> ## スコープ管理
>
> ### 高度なスコープシステム
>
> ```typescript
> interface ScopeContext {
>         node: NodeProxy
>         variables: Map<string, NodeProxy>
>         functions: Map<string, NodeProxy>
>         parent?: ScopeContext
> }
>
> let currentScope: ScopeContext | null = null
>
> const scoped = (scopeNode: NodeProxy, callback: () => void) => {
>         const parentScope = currentScope
>         currentScope = {
>                 node: scopeNode,
>                 variables: new Map(),
>                 functions: new Map(),
>                 parent: parentScope,
>         }
>
>         try {
>                 callback()
>         } finally {
>                 currentScope = parentScope
>         }
> }
> ```

try catch を使用しないでください
変数名は `_scope` から変更しないでください。
Context を使用しないで、props をいじるだけで実装できないか考えてください（context が必要であれば問題ない）
`node: scopeNode,` や `parent: parentScope,` はようとがわからないが期待しています

> ## 数学関数
>
> ### メソッドチェーン対応コア数学関数
>
> ```typescript
> // 基本数学関数
> export const abs = (x: any) => node('math_fun', null, 'abs', x)
> export const sin = (x: any) => node('math_fun', null, 'sin', x)
> export const cos = (x: any) => node('math_fun', null, 'cos', x)
> export const sqrt = (x: any) => node('math_fun', null, 'sqrt', x)
> export const normalize = (x: any) => node('math_fun', null, 'normalize', x)
>
> // ベクトル関数
> export const length = (x: any) => node('math_fun', null, 'length', x)
> export const distance = (x: any, y: any) => node('math_fun', null, 'distance', x, y)
> export const dot = (x: any, y: any) => node('math_fun', null, 'dot', x, y)
> export const cross = (x: any, y: any) => node('math_fun', null, 'cross', x, y)
>
> // 補間
> export const mix = (x: any, y: any, a: any) => node('math_fun', null, 'mix', x, y, a)
> export const step = (edge: any, x: any) => node('math_fun', null, 'step', edge, x)
> export const smoothstep = (edge0: any, edge1: any, x: any) => node('math_fun', null, 'smoothstep', edge0, edge1, x)
> ```

`export const abs = (x: any) => x.abs()` だと x が NodeProxy でない可能性があるので、
現状の上記のような関数で問題ないです
あまり変更は必要なさそう？？
変数名やコメントは three.js の tsl のドキュメントと一致させています
実装はなるべく tsl の実際の ref からずらさないでください

> ## シェーダー生成
>
> ### 拡張コード生成
>
> ```typescript
> export const generateShader = (rootNode: any, config: ShaderConfig): { vertex: string; fragment: string } => {
>         const builder = new ShaderBuilder(config)
>
>         // シェーダーツリー構築
>         const result = builder.build(rootNode)
>
>         return {
>                 vertex: builder.generateVertex(result),
>                 fragment: builder.generateFragment(result),
>         }
> }
>
> interface ShaderConfig {
>         target: 'webgl' | 'webgpu'
>         optimize: boolean
>         uniforms: Map<string, UniformInfo>
>         attributes: Map<string, AttributeInfo>
>         varyings: Map<string, VaryingInfo>
> }
> ```

function は scope で定義するため ShaderConfig では定義しないということ？でよさそう
uniforms / attributes / varyings を Map で用意して、最後にまとめて uniform を import する shader に変更できればと思っています
texture は uniform

> ### テクスチャとサンプリング操作
>
> ```typescript
> // テクスチャ操作
> export const texture = (tex: any, uv: any, level?: any) => {
>         return node('texture', null, 'texture', tex, uv, level)
> }
>
> export const cubeTexture = (tex: any, direction: any, level?: any) => {
>         return node('texture', null, 'cubeTexture', tex, direction, level)
> }
>
> export const textureSize = (tex: any, level?: any) => {
>         return node('texture', null, 'textureSize', tex, level)
> }
> ```

cubeTexture とかの glsl / wgsl はくわしくないのえどまかせ

> ### ビルトイン変数とアトリビュート
>
> ```typescript
> // ポジション変数
> export const positionGeometry = node('builtin', { id: 'positionGeometry' })
> export const positionLocal = node('builtin', { id: 'positionLocal' })
> export const positionWorld = node('builtin', { id: 'positionWorld' })
> export const positionView = node('builtin', { id: 'positionView' })
>
> // 法線変数
> export const normalGeometry = node('builtin', { id: 'normalGeometry' })
> export const normalLocal = node('builtin', { id: 'normalLocal' })
> export const normalWorld = node('builtin', { id: 'normalWorld' })
> export const normalView = node('builtin', { id: 'normalView' })
>
> // スクリーンとビューポート
> export const screenUV = node('builtin', { id: 'screenUV' })
> export const screenCoordinate = node('builtin', { id: 'screenCoordinate' })
> export const viewportUV = node('builtin', { id: 'viewportUV' })
>
> // アトリビュート
> export const uv = (index = 0) => node('attribute', { id: `uv${index || ''}` })
> export const vertexColor = (index = 0) => node('attribute', { id: `color${index || ''}` })
> export const attribute = (name: string, type?: string) => node('attribute', { id: name, type })
> ```

variable node が id で指定した名前をそのままかえせるはずです
isWebGL で分岐して gl_FragCoord と position とか名前を分岐する機構が必要そうではありますが、、、
ビルドイン変数は glsl / wgsl で変数名や挙動がかわってくるので難しそう（最低限でよさげ）

> ## 実装優先度
>
> ### Phase 1: コア拡張（高優先度）
>
> 1. **数学関数のメソッドチェーン**
>
>       - メソッドチェーンシステム実装
>       - 全数学関数のメソッド化
>       - 型変換メソッド追加
>
> 2. **高度な制御フロー**
>
>       - `Switch`/`Case`文実装
>       - 三項演算（`select`）追加
>       - 設定付きループシステム拡張
>
> 3. **拡張関数システム**
>       - 関数レイアウトとパラメータ型指定
>       - 関数キャッシュと最適化
>       - 適切な関数スコープ

絶対実装すること

> ### Phase 2: シェーダー統合（中優先度）
>
> 1. **ビルトイン変数とアトリビュート**
>
>       - ポジション、法線、UV 変数
>       - スクリーンとビューポート座標
>       - 時間とアニメーション変数

時間とアニメーション変数は iTime で実装しています
これは cpu / gpu 側の glre 側の機能っぽいですが、
今回は typescript から glsl / wgsl に変換する node system だけのスコープです
glre 本体の機能については実装しないこと

> 2. **テクスチャ操作**
>
>       - 基本テクスチャサンプリング
>       - キューブテクスチャサポート
>       - テクスチャユーティリティ関数

必要そうです

> 3. **varying と頂点ステージ**
>       - 頂点/フラグメント通信
>       - 適切な varying 宣言
>       - 頂点ステージ最適化

頂点/フラグメント通信 / 適切な varying 宣言 / 頂点ステージ最適化 は必要
uniform / attribute と同様に実装できそう（実装時は対称性をもたせてなるべく共通化すること）

> ### Phase 3: 高度な機能（低優先度）
>
> 1. **uniform 拡張**
>
>       - 更新イベント（onFrameUpdate 等）
>       - 自動 uniform 収集
>       - uniform 最適化

uniform 収集は必要
uniform 最適化？は意味がわからないが、パフォーマンス最適化は絶対必要ない

> 2. **マテリアル統合**
>
>       - マテリアルノード接続
>       - ライティングモデルサポート
>       - PBR マテリアルノード
>
> 3. **高度な最適化**
>       - ノードキャッシュシステム
>       - 自動最適化パス
>       - パフォーマンス分析

上記必要ないです
マテリアルノード接続 / ライティングモデルサポート / PBR マテリアルノード　は必要ありません
ノードキャッシュシステム / 自動最適化パス / パフォーマンス分析　は必要ありません

> ### Phase 4: エコシステム統合
>
> 1. **Three.js 統合**
>
>       - NodeMaterial 互換性
>       - Three.js レンダラーサポート
>       - マテリアルエディタツール
>
> 2. **開発ツール**
>       - シェーダーデバッグ
>       - ビジュアルノードエディタ
>       - パフォーマンス分析

Three.js shading language と互換性を持たせる必要がありますが、Three.js 統合は必要ありません
シェーダーデバッグ / ビジュアルノードエディタ / パフォーマンス分析 は必要ありません。

> ## 結論
>
> この仕様書は、Three.js TSL との互換性を達成しつつ、独自の TypeScript-first アプローチを維持する glre ノードシステム拡張の包括的ロードマップを提供。実装はコア機能を優先し、次にシェーダー統合機能、最後に高度な最適化とエコシステム統合を行う。
>
> 目標は、WebGL/WebGPU エコシステムの既存ソリューションと競合し、補完できる強力で型安全で開発者フレンドリーなシェーダー作成システムの構築。
