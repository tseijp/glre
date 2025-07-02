import { is } from '../utils/helpers'
import { code } from './parsers/code'
import {
        CONSTANTS,
        CONVERSIONS,
        FUNCTIONS,
        OPERATOR_KEYS,
        OPERATORS,
        TYPE_MAPPING,
        WGSL_TO_GLSL_BUILTIN,
} from './const'
import type { Constants, Conversions, Functions, NodeContext, NodeProxy, Operators, Swizzles, X } from './types'

export const isStruct = (x: NodeProxy) => {
        return x.type === 'variable' && x.props.structNode
}

export const isSwizzle = (key: unknown): key is Swizzles => {
        return is.str(key) && /^[xyzwrgbastpq]{1,4}$/.test(key)
}

export const isOperator = (key: unknown): key is Operators => {
        return OPERATOR_KEYS.includes(key as Operators)
}

export const isFunction = (key: unknown): key is Functions => {
        return FUNCTIONS.includes(key as Functions)
}

export const isConversion = (key: unknown): key is Conversions => {
        return CONVERSIONS.includes(key as Conversions)
}

export const isNodeProxy = (x: unknown): x is NodeProxy => {
        if (!x) return false
        if (typeof x !== 'object') return false // @ts-ignore
        return x.isProxy
}

export const isConstantsType = (type?: Constants | 'auto'): type is Constants => {
        if (!type) return false
        if (type === 'auto') return false
        return true
}

export const hex2rgb = (hex: number) => {
        const r = ((hex >> 16) & 0xff) / 255
        const g = ((hex >> 8) & 0xff) / 255
        const b = (hex & 0xff) / 255
        return [r, g, b]
}

let count = 0

export const getId = () => `i${count++}`

export const joins = (children: X[], c: NodeContext) => {
        return children
                .filter((x) => !is.und(x) && !is.nul(x))
                .map((x) => code(x, c))
                .join(', ')
}

export const formatConversions = (x: X, c?: NodeContext) => {
        if (!is.str(x)) return ''
        if (c?.isWebGL) return x
        return TYPE_MAPPING[x as keyof typeof TYPE_MAPPING]
}

export const getOperator = (op: X) => {
        return OPERATORS[op as keyof typeof OPERATORS] || op
}

export const getBluiltin = (id: string) => {
        return WGSL_TO_GLSL_BUILTIN[id as keyof typeof WGSL_TO_GLSL_BUILTIN]
}

export const conversionToConstant = (conversionKey: string): Constants => {
        const index = CONVERSIONS.indexOf(conversionKey as Conversions)
        return index !== -1 ? CONSTANTS[index] : 'float'
}
