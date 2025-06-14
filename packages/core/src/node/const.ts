// 基本型定数
export const TYPES = [
        'float',
        'int',
        'uint',
        'bool',
        'color',
        'vec2',
        'vec3',
        'vec4',
        'mat2',
        'mat3',
        'mat4',
        'ivec2',
        'ivec3',
        'ivec4',
        'uvec2',
        'uvec3',
        'uvec4',
        'bvec2',
        'bvec3',
        'bvec4',
] as const

export type NodeType = (typeof TYPES)[number]

// スウィズル定数
export const SWIZZLES = ['x', 'y', 'z', 'w', 'r', 'g', 'b', 'a', 's', 't', 'p', 'q'] as const

type AllSwizzles<T extends string> = T | `${T}${T}` | `${T}${T}${T}` | `${T}${T}${T}${T}`

export type Swillzes =
        | AllSwizzles<'x' | 'y' | 'z' | 'w'>
        | AllSwizzles<'r' | 'g' | 'b' | 'a'>
        | AllSwizzles<'p' | 'q'>
        | AllSwizzles<'s' | 't'>

// 演算子定数
export const OPERATORS = [
        'add',
        'sub',
        'mul',
        'div',
        'mod',
        'equal',
        'notEqual',
        'lessThan',
        'lessThanEqual',
        'greaterThan',
        'greaterThanEqual',
        'and',
        'or',
        'not',
        'assign',
        'xor',
        'bitAnd',
        'bitNot',
        'bitOr',
        'bitXor',
        'shiftLeft',
        'shiftRight',
] as const

export type Operator = (typeof OPERATORS)[number]

// 数学関数定数
export const FUNCTIONS = [
        'abs',
        'acos',
        'asin',
        'atan',
        'atan2',
        'ceil',
        'clamp',
        'cos',
        'cross',
        'degrees',
        'distance',
        'dot',
        'exp',
        'exp2',
        'faceforward',
        'floor',
        'fract',
        'length',
        'all',
        'any',
        'bitcast',
        'cbrt',
        'dFdx',
        'dFdy',
        'difference',
        'equals',
        'fwidth',
        'inverseSqrt',
        'lengthSq',
        'log',
        'log2',
        'max',
        'min',
        'mix',
        'negate',
        'normalize',
        'oneMinus',
        'pow',
        'pow2',
        'pow3',
        'pow4',
        'radians',
        'reciprocal',
        'reflect',
        'refract',
        'round',
        'saturate',
        'sign',
        'sin',
        'smoothstep',
        'sqrt',
        'step',
        'tan',
        'transformDirection',
        'trunc',
] as const

export type MathFunction = (typeof FUNCTIONS)[number]

// キャッシュ用定数
export const CACHE_BOOLS = [true, false] as const
export const CACHE_INTS = [0, 1, 2, 3, 4, 5] as const
export const CACHE_FLOATS = [0.0, 1.0, 0.5, 2.0] as const
