import { is } from '../native'

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

export const SWIZZLES = ['x', 'y', 'z', 'w', 'r', 'g', 'b', 'a', 's', 't', 'p', 'q'] as const

type AllSwizzles<T extends string> = T | `${T}${T}` | `${T}${T}${T}` | `${T}${T}${T}${T}`

export type Swizzles =
        | AllSwizzles<'x' | 'y' | 'z' | 'w'>
        | AllSwizzles<'r' | 'g' | 'b' | 'a'>
        | AllSwizzles<'p' | 'q'>
        | AllSwizzles<'s' | 't'>

export const OPERATORS = {
        add: '+',
        sub: '-',
        mul: '*',
        div: '/',
        mod: '%',
        equal: '==',
        notEqual: '!=',
        lessThan: '<',
        lessThanEqual: '<=',
        greaterThan: '>',
        greaterThanEqual: '>=',
        and: '&&',
        or: '||',
        bitAnd: '&',
        bitOr: '|',
        bitXor: '^',
        shiftLeft: '<<',
        shiftRight: '>>',
} as const

const OPERATOR_KEYS = Object.keys(OPERATORS)

export type Operator = (typeof OPERATOR_KEYS)[number]

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

export const isOperator = (key: any): key is Operator => {
        return is.str(key) && OPERATOR_KEYS.includes(key as Operator)
}

export const isSwizzle = (key: any): key is Swizzles => {
        return is.str(key) && /^[xyzwrgbastpq]{1,4}$/.test(key)
}

export const isType = (key: any): key is NodeType => {
        return is.str(key) && TYPES.includes(key as NodeType)
}

export const isFunction = (key: any): key is MathFunction => {
        return is.str(key) && FUNCTIONS.includes(key as MathFunction)
}
