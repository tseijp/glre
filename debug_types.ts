import { OPERATOR_TYPE_RULES } from './packages/core/src/node/utils/const'

// OPERATOR_TYPE_RULES の内容を確認
type Rules = typeof OPERATOR_TYPE_RULES[number]

// テスト用の型
type TestValidate1 = Rules extends readonly [infer Left, infer Right, any]
  ? ('vec2' extends Left ? 'vec3' extends Right ? true : false : false) |
    ('vec2' extends Right ? 'vec3' extends Left ? true : false : false)
  : false

// 結果をテスト - これは false になるはず
const test1: TestValidate1 = false

// 正しい組み合わせのテスト - これは true になるはず  
type TestValidate2 = Rules extends readonly [infer Left, infer Right, any]
  ? ('float' extends Left ? 'vec2' extends Right ? true : false : false) |
    ('float' extends Right ? 'vec2' extends Left ? true : false : false)
  : false

const test2: TestValidate2 = true