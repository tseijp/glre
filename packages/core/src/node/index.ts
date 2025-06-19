import { is } from '../utils/helpers'
import { isFunction, isOperator, isSwizzle, isType, OPERATORS, Swizzles } from './const'
import type { NodeProps, NodeState, NodeTypes, X } from './types'
export * from './const'
export * from './types'

let isWGSL = false

export const setContext = (target: 'glsl' | 'wgsl') => {
        isWGSL = target === 'wgsl'
}

const primitiveConverter = (...args: X[]) => {
        return (hint: string) => {
                if (hint === 'string' || hint === 'default') return shader(...args)
        }
}

export const node = (type: NodeTypes, props?: NodeProps | null, ...args: X[]) => {
        if (!props) props = {}
        if (args.length) props.children = is.arr(args) ? args : [args]
        if (!props.children) props.children = []
        const ret = new Proxy(() => {}, {
                get(_, key) {
                        if (key === Symbol.toPrimitive) return primitiveConverter(ret)
                        if (key === 'toString') return () => shader(ret)
                        if (key === 'props') return props
                        if (key === 'type') return type
                        if (key === 'toVar') return () => id(...props.children!)
                        if (isSwizzle(key)) return node('swizzle', {}, key)
                        if (isOperator(key) || isFunction(key) || isType(key)) {
                                const _type = isOperator(key) ? 'operator' : isFunction(key) ? 'function' : 'type'
                                return (...newArgs: X[]) => node(_type, {}, key, ...props.children!, ...newArgs)
                        }
                        return key
                },
        }) as unknown as NodeState
        return ret
}

const exist = (v: X) => !is.und(v) && !is.nul(v)

const joins = (children: X[]) => children.filter(exist).map(shader).join(', ')

const shader = (x?: X): string => {
        if (!x) return ''
        if (is.num(x)) return x.toFixed(1)
        if (is.str(x)) return x
        const type = x.type
        const { id, children = [] } = x.props
        const [a, b, c] = children
        if (type === 'uniform') return a as string
        if (type === 'variable') return id ?? ''
        if (type === 'swizzle') return `${shader(x)}.${a}`
        if (type === 'operator') {
                const opName = a as string
                const op = OPERATORS[opName as keyof typeof OPERATORS]
                if (!op) return opName
                if (opName === 'not' || opName === 'bitNot') return `${op}${shader(b)}`
                return `(${shader(b)} ${op} ${shader(c)})`
        }
        if (type === 'type') {
                const typeName = a as string
                const func = isWGSL && typeName.startsWith('vec') ? `${typeName}f` : typeName
                const args = joins(children.slice(1))
                return `${func}(${args})`
        }
        if (type === 'function') {
                const funcName = a
                const args = joins(children.slice(1))
                return `${funcName}(${args})`
        }
        return type
}

export const uniform = (name: string, defaultValue?: number | number[]) => node('uniform', { defaultValue }, name)
export const iResolution = uniform('iResolution', [1280, 800])
export const iMouse = uniform('iMouse', [0, 0])
export const iTime = uniform('iTime', 0)
export const fragCoord = node('variable', { id: 'gl_FragCoord' })

export const sw = (name: Swizzles, arg: X) => node('swizzle', {}, name, arg)
export const op = (name: string, ...args: X[]) => node('operator', {}, name, ...args)
export const fn = (name: string, ...args: X[]) => node('function', {}, name, ...args)
export const tp = (name: string, ...args: X[]) => node('type', {}, name, ...args)
export const id = (...args: X[]) => node('variable', { id: Math.random().toString(36).slice(2, 6) }, ...args)

// Type constructors
export const float = (x: X) => tp('float', x)
export const int = (x: X) => tp('int', x)
export const uint = (x: X) => tp('uint', x)
export const bool = (x: X) => tp('bool', x)
export const vec2 = (x?: X, y?: X) => tp('vec2', x, y)
export const vec3 = (x?: X, y?: X, z?: X) => tp('vec3', x, y, z)
export const vec4 = (x?: X, y?: X, z?: X, w?: X) => tp('vec4', x, y, z, w)
export const mat2 = (...args: X[]) => tp('mat2', ...args)
export const mat3 = (...args: X[]) => tp('mat3', ...args)
export const mat4 = (...args: X[]) => tp('mat4', ...args)
export const ivec2 = (x?: X, y?: X) => tp('ivec2', x, y)
export const ivec3 = (x?: X, y?: X, z?: X) => tp('ivec3', x, y, z)
export const ivec4 = (x?: X, y?: X, z?: X, w?: X) => tp('ivec4', x, y, z, w)
export const uvec2 = (x?: X, y?: X) => tp('uvec2', x, y)
export const uvec3 = (x?: X, y?: X, z?: X) => tp('uvec3', x, y, z)
export const uvec4 = (x?: X, y?: X, z?: X, w?: X) => tp('uvec4', x, y, z, w)
export const bvec2 = (x?: X, y?: X) => tp('bvec2', x, y)
export const bvec3 = (x?: X, y?: X, z?: X) => tp('bvec3', x, y, z)
export const bvec4 = (x?: X, y?: X, z?: X, w?: X) => tp('bvec4', x, y, z, w)

// Math functions
export const abs = (x: X) => fn('abs', x)
export const acos = (x: X) => fn('acos', x)
export const asin = (x: X) => fn('asin', x)
export const atan = (x: X) => fn('atan', x)
export const atan2 = (y: X, x: X) => fn('atan2', y, x)
export const ceil = (x: X) => fn('ceil', x)
export const clamp = (x: X, min: X, max: X) => fn('clamp', x, min, max)
export const cos = (x: X) => fn('cos', x)
export const cross = (a: X, b: X) => fn('cross', a, b)
export const degrees = (x: X) => fn('degrees', x)
export const distance = (a: X, b: X) => fn('distance', a, b)
export const dot = (a: X, b: X) => fn('dot', a, b)
export const exp = (x: X) => fn('exp', x)
export const exp2 = (x: X) => fn('exp2', x)
export const faceforward = (n: X, i: X, nref: X) => fn('faceforward', n, i, nref)
export const floor = (x: X) => fn('floor', x)
export const fract = (x: X) => fn('fract', x)
export const length = (x: X) => fn('length', x)
export const all = (x: X) => fn('all', x)
export const any = (x: X) => fn('any', x)
export const bitcast = (x: X) => fn('bitcast', x)
export const cbrt = (x: X) => fn('cbrt', x)
export const dFdx = (x: X) => fn('dFdx', x)
export const dFdy = (x: X) => fn('dFdy', x)
export const difference = (a: X, b: X) => fn('difference', a, b)
export const equals = (a: X, b: X) => fn('equals', a, b)
export const fwidth = (x: X) => fn('fwidth', x)
export const inverseSqrt = (x: X) => fn('inverseSqrt', x)
export const lengthSq = (x: X) => fn('lengthSq', x)
export const log = (x: X) => fn('log', x)
export const log2 = (x: X) => fn('log2', x)
export const max = (a: X, b: X) => fn('max', a, b)
export const min = (a: X, b: X) => fn('min', a, b)
export const mix = (a: X, b: X, t: X) => fn('mix', a, b, t)
export const negate = (x: X) => fn('negate', x)
export const normalize = (x: X) => fn('normalize', x)
export const oneMinus = (x: X) => fn('oneMinus', x)
export const pow = (x: X, y: X) => fn('pow', x, y)
export const pow2 = (x: X) => fn('pow2', x)
export const pow3 = (x: X) => fn('pow3', x)
export const pow4 = (x: X) => fn('pow4', x)
export const radians = (x: X) => fn('radians', x)
export const reciprocal = (x: X) => fn('reciprocal', x)
export const reflect = (i: X, n: X) => fn('reflect', i, n)
export const refract = (i: X, n: X, eta: X) => fn('refract', i, n, eta)
export const round = (x: X) => fn('round', x)
export const saturate = (x: X) => fn('saturate', x)
export const sign = (x: X) => fn('sign', x)
export const sin = (x: X) => fn('sin', x)
export const smoothstep = (edge0: X, edge1: X, x: X) => fn('smoothstep', edge0, edge1, x)
export const sqrt = (x: X) => fn('sqrt', x)
export const step = (edge: X, x: X) => fn('step', edge, x)
export const tan = (x: X) => fn('tan', x)
export const transformDirection = (x: X, matrix: X) => fn('transformDirection', x, matrix)
export const trunc = (x: X) => fn('trunc', x)
