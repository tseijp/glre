# GLRE Node System テスト設計書

## この設計仕様が必要なのか

glre/node システムは JavaScript から GLSL/WGSL コードを生成する中間言語であり、シェーダーコンパイラとしての責任を負っている。このシステムの型推論エンジン、抽象構文木の構築処理、コード生成機能、scope 管理機能が正確に動作することはレンダリング結果に直接的な影響を与えるため、包括的なテストによる品質保証が不可欠である。

型推論失敗は shader code の間違った型生成を引き起こし、varying 処理の不具合は vertex-fragment 間のデータ転送を破綻させ、swizzle での型ずれは GPU 計算結果の意図しない変化をもたらす。これらの問題は実行時にしか検出されず、かつ原因の特定が困難である。

従って unit test において各機能の動作を細分化して検証し、変更による影響範囲を明確にし、問題発生時の迅速な原因特定を可能にする必要がある。

## 何をテストするのか

### 抽象概念設計フレームワーク

テスト対象を三つの抽象層に分類してアプローチする。

```
Layer 1: 基盤システム層
├── 型推論エンジン (Type Inference Engine)
├── 抽象構文木構築 (AST Construction)
└── コード生成エンジン (Code Generation)

Layer 2: 言語機能層
├── ノード作成と操作 (Node Creation & Operations)
├── scope 管理システム (Scope Management)
└── 関数定義システム (Function Definition)

Layer 3: 統合機能層
├── varying 処理システム (Varying Processing)
├── storage buffer 管理 (Storage Management)
└── struct 処理システム (Struct Processing)
```

### 基盤システム層の検証範囲

#### 型推論エンジンの漸近的型決定機能

JavaScript runtime における動的型推論機能が shader 型として正確に決定されることを検証する。primitive 値からの自動型推論、関数戻り値の漸近的決定、operator における型昇格規則、swizzle 操作での正確な型決定を確認する。

特に ivec2.x が int として推論され float にならないこと、attribute での stride 計算からの型決定が accurate であること、Loop 変数の型決定が operator type に基づくこと、Fn 関数内の early return による型決定が適切に機能することを重点的に検証する。

#### 抽象構文木構築の正確性確認

NodeProxy による method chaining が意図した抽象構文木を構築することを検証する。operator precedence の維持、nested function call の構造化、conditional branching の AST 表現、Loop 構造の tree 構築を確認する。

各 node の type/props/children 構造が specification に準拠すること、parent-child 関係が正確に維持されること、dependency graph が cyclic reference を回避することを検証する。

#### コード生成エンジンの出力精度確保

抽象構文木から GLSL/WGSL コードへの変換が syntax specification に準拠することを検証する。operator symbol の正確な mapping、function call の parameter 順序、variable scope の適切な処理、header generation の dependency 順序を確認する。

WebGL/WebGPU 間での差異 handling、builtin variable の適切な mapping、topological sort の dependency resolution を重点的に検証する。

### 言語機能層の検証範囲

#### ノード作成と操作の信頼性確保

factory function による node 生成、method chaining による operation、type conversion の automatic handling、swizzling operation の動作を検証する。

uniform/attribute/storage/constant node の生成、primitive value からの automatic wrapping、arithmetic/comparison/logical operation の動作、assignment operation による scope への影響を確認する。

#### Scope 管理システムの動作保証

toVar による変数宣言、addToScope による statement 追加、scoped function による context 切り替え、nested scope における variable visibility を検証する。

If/Loop/Switch における scope 階層、early return による scope 終了、variable shadowing の防止、scope crossing による side effect の回避を重点的に確認する。

#### 関数定義システムの正確性確認

Fn による function 定義、parameter の type inference、return type の漸近的決定、setLayout による explicit specification を検証する。

closure 内での variable access、parameter binding の正確性、nested function call における scope isolation、layout specification と runtime inference の整合性を確認する。

### 統合機能層の検証範囲

#### Varying 処理システムの堅牢性確保

varying 変数の検出、fragment shader における input struct 生成、vertex shader における output struct 生成、 input/output 判定を検証する。

fragment shader build 先行による varying detection、location number の automatic assignment、struct field の type consistency、WebGL/WebGPU における declaration format の差異を重点的に確認する。

#### Storage Buffer 管理の信頼性確保

gather/scatter operation の WebGL/WebGPU implementation、storage buffer の type inference、element access における index 計算、texture buffer と storage buffer の使い分けを検証する。

WebGL における texture buffer based implementation、WebGPU における storage buffer API utilization、index boundary の適切な handling を確認する。

#### Struct 処理システムの複雑性制御

struct definition の header generation、field type の dependency resolution、constructor における parameter 順序、topological sort による header ordering を検証する。

cyclic dependency の検出と回避、nested struct の recursive processing、initialization value の type matching を重点的に確認する。

## どのようにテストを実行するのか

### テスト実行戦略

対称性原理に基づく test case design を採用する。各機能において基本的なケースと boundary condition、error condition の組み合わせで包括的に検証する。

#### 型推論テスト実行パターン

```
Base Pattern:
入力値 → 型推論実行 → 期待型との比較

Extension Pattern:
複合式 → 段階的推論 → 各段階での型確認

Edge Pattern:
境界値 → 推論処理 → 例外処理確認
```

primitive value、array length、operator combination、function return、swizzle operation の各カテゴリで base/extension/edge pattern を適用する。

#### AST 構築テスト実行パターン

```
Structure Pattern:
expression → AST build → tree structure verification

Nesting Pattern:
nested expression → recursive build → depth verification

Composition Pattern:
multiple expression → composition → relationship verification
```

arithmetic operation、function call、conditional expression、loop statement の各構造で pattern を展開する。

#### コード生成テスト実行パターン

```
Translation Pattern:
AST → code generation → syntax verification

Context Pattern:
context variation → code adaptation → output difference verification

Cross-Platform Pattern:
same AST → WebGL/WebGPU → platform difference verification
```

GLSL/WGSL syntax rule、builtin variable mapping、header dependency ordering における pattern application を実行する。

#### Scope 管理テスト実行パターン

```
Isolation Pattern:
scope operation → isolation verification → side effect check

Hierarchy Pattern:
nested scope → hierarchy verification → visibility check

Lifecycle Pattern:
scope creation/destruction → lifecycle verification → cleanup check
```

variable declaration、statement addition、context switching における pattern で検証を実行する。

#### Varying 処理テスト実行パターン

```
Detection Pattern:
varying usage → detection verification → registration check

Generation Pattern:
detected varying → struct generation → field verification

Integration Pattern:
vertex/fragment → integration verification → data consistency check
```

context switching、location assignment、type consistency における pattern application を実行する。

#### Storage 処理テスト実行パターン

```
Platform Pattern:
storage operation → platform detection → implementation verification

Access Pattern:
element access → index calculation → boundary verification

Consistency Pattern:
gather/scatter → operation consistency → data integrity verification
```

WebGL texture buffer、WebGPU storage buffer、index calculation における pattern で検証を実行する。

#### Struct 処理テスト実行パターン

```
Definition Pattern:
field definition → struct generation → type verification

Dependency Pattern:
struct dependency → topological sort → order verification

Construction Pattern:
struct construction → initialization → field verification
```

header generation、dependency resolution、constructor parameter における pattern application を実行する。

### テストケース実行順序と依存関係管理

テスト実行において層間の依存関係を考慮した実行順序を定める。基盤システム層の確認を先行し、言語機能層、統合機能層の順序で段階的に検証を進める。

各層において critical path となる機能を優先し、dependency の少ない単体機能から複合機能へと段階的に拡張する。failing fast principle に基づき、基盤機能の failure 時には dependent test の実行を停止し、効率的な debugging を可能にする。

### 回帰テスト戦略と継続的検証

変更 impact の範囲を特定するため、変更された component に関連する test case を優先実行する仕組みを構築する。型推論 engine の変更時には全 type 関連 test、コード生成 engine の変更時には全 output 関連 test を重点実行する。

test case 間の独立性を保持し、一つの test failure が他の test 実行に影響しない isolation を維持する。shared state の回避、clean setup/teardown の実行、deterministic result の保証により再現性の高い test 環境を確保する。

### 測定可能な品質指標設定

機能 coverage、code path coverage、edge case coverage の三つの観点で品質測定を行う。各機能において正常系、異常系、境界値の組み合わせで comprehensive verification を実現する。

type inference accuracy、AST structure validity、code generation correctness、scope management integrity を定量化し、継続的な品質改善に活用する。

## テスト設計の実装方針

各テストカテゴリは相互に独立性を保ちながら、包括的な機能検証を実現するよう設計する。基盤システム層の test failure が言語機能層の問題なのか統合機能層の問題なのかを明確に分離できるよう、responsibility boundary を明確に定義する。

複雑な shader code の生成能力を確認しつつ、unit test の scope を超えない適切な粒度を維持する。各 test case は単一の responsibility を持ち、failure 時の原因特定を容易にする。

テスト実装においては mock や stub を極力使用せず、実際の glre/node system の動作を直接検証することで、実環境との整合性を保つ。test case 自体が glre/node system の使用例としても機能し、documentation としての価値も提供する。
