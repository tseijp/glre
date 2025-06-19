import type { Swizzles } from './const'
import { node } from './index'

export interface X extends Record<Swizzles, X> {
        add(n: number | X): X
        sub(n: number | X): X
        mul(n: number | X): X
        div(n: number | X): X
        mod(n: number | X): X
        equal(n: number | X): X
        notEqual(n: number | X): X
        lessThan(n: number | X): X
        lessThanEqual(n: number | X): X
        greaterThan(n: number | X): X
        greaterThanEqual(n: number | X): X
        and(n: number | X): X
        or(n: number | X): X
        not(): X
        assign(n: number | X): X
        toVar(): X
        toString(): string
}

export type NodeChild = number | string | X | null | undefined

export interface NodeProps {
        id?: string
        value?: any
        children?: NodeChild[]
}

// Type constructors
export const float = (x: any) => node('float', {}, x)
export const int = (x: any) => node('int', {}, x)
export const uint = (x: any) => node('uint', {}, x)
export const bool = (x: any) => node('bool', {}, x)
export const vec2 = (x?: any, y?: any) => node('vec2', {}, x, y)
export const vec3 = (x?: any, y?: any, z?: any) => node('vec3', {}, x, y, z)
export const vec4 = (x?: any, y?: any, z?: any, w?: any) => node('vec4', {}, x, y, z, w)
export const mat2 = (...args: any[]) => node('mat2', {}, ...args)
export const mat3 = (...args: any[]) => node('mat3', {}, ...args)
export const mat4 = (...args: any[]) => node('mat4', {}, ...args)
export const ivec2 = (x?: any, y?: any) => node('ivec2', {}, x, y)
export const ivec3 = (x?: any, y?: any, z?: any) => node('ivec3', {}, x, y, z)
export const ivec4 = (x?: any, y?: any, z?: any, w?: any) => node('ivec4', {}, x, y, z, w)
export const uvec2 = (x?: any, y?: any) => node('uvec2', {}, x, y)
export const uvec3 = (x?: any, y?: any, z?: any) => node('uvec3', {}, x, y, z)
export const uvec4 = (x?: any, y?: any, z?: any, w?: any) => node('uvec4', {}, x, y, z, w)
export const bvec2 = (x?: any, y?: any) => node('bvec2', {}, x, y)
export const bvec3 = (x?: any, y?: any, z?: any) => node('bvec3', {}, x, y, z)
export const bvec4 = (x?: any, y?: any, z?: any, w?: any) => node('bvec4', {}, x, y, z, w)

// Math functions
export const abs = (x: X) => node('abs', {}, x)
export const acos = (x: X) => node('acos', {}, x)
export const asin = (x: X) => node('asin', {}, x)
export const atan = (x: X) => node('atan', {}, x)
export const atan2 = (y: X, x: X) => node('atan2', {}, y, x)
export const ceil = (x: X) => node('ceil', {}, x)
export const clamp = (x: X, min: X, max: X) => node('clamp', {}, x, min, max)
export const cos = (x: X) => node('cos', {}, x)
export const cross = (a: X, b: X) => node('cross', {}, a, b)
export const degrees = (x: X) => node('degrees', {}, x)
export const distance = (a: X, b: X) => node('distance', {}, a, b)
export const dot = (a: X, b: X) => node('dot', {}, a, b)
export const exp = (x: X) => node('exp', {}, x)
export const exp2 = (x: X) => node('exp2', {}, x)
export const faceforward = (n: X, i: X, nref: X) => node('faceforward', {}, n, i, nref)
export const floor = (x: X) => node('floor', {}, x)
export const fract = (x: X) => node('fract', {}, x)
export const length = (x: X) => node('length', {}, x)
export const all = (x: X) => node('all', {}, x)
export const any = (x: X) => node('any', {}, x)
export const bitcast = (x: X) => node('bitcast', {}, x)
export const cbrt = (x: X) => node('cbrt', {}, x)
export const dFdx = (x: X) => node('dFdx', {}, x)
export const dFdy = (x: X) => node('dFdy', {}, x)
export const difference = (a: X, b: X) => node('difference', {}, a, b)
export const equals = (a: X, b: X) => node('equals', {}, a, b)
export const fwidth = (x: X) => node('fwidth', {}, x)
export const inverseSqrt = (x: X) => node('inverseSqrt', {}, x)
export const lengthSq = (x: X) => node('lengthSq', {}, x)
export const log = (x: X) => node('log', {}, x)
export const log2 = (x: X) => node('log2', {}, x)
export const max = (a: X, b: X) => node('max', {}, a, b)
export const min = (a: X, b: X) => node('min', {}, a, b)
export const mix = (a: X, b: X, t: X) => node('mix', {}, a, b, t)
export const negate = (x: X) => node('negate', {}, x)
export const normalize = (x: X) => node('normalize', {}, x)
export const oneMinus = (x: X) => node('oneMinus', {}, x)
export const pow = (x: X, y: X) => node('pow', {}, x, y)
export const pow2 = (x: X) => node('pow2', {}, x)
export const pow3 = (x: X) => node('pow3', {}, x)
export const pow4 = (x: X) => node('pow4', {}, x)
export const radians = (x: X) => node('radians', {}, x)
export const reciprocal = (x: X) => node('reciprocal', {}, x)
export const reflect = (i: X, n: X) => node('reflect', {}, i, n)
export const refract = (i: X, n: X, eta: X) => node('refract', {}, i, n, eta)
export const round = (x: X) => node('round', {}, x)
export const saturate = (x: X) => node('saturate', {}, x)
export const sign = (x: X) => node('sign', {}, x)
export const sin = (x: X) => node('sin', {}, x)
export const smoothstep = (edge0: X, edge1: X, x: X) => node('smoothstep', {}, edge0, edge1, x)
export const sqrt = (x: X) => node('sqrt', {}, x)
export const step = (edge: X, x: X) => node('step', {}, edge, x)
export const tan = (x: X) => node('tan', {}, x)
export const transformDirection = (x: X, matrix: X) => node('transformDirection', {}, x, matrix)
export const trunc = (x: X) => node('trunc', {}, x)
