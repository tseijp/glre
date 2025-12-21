import { CONSTANTS, CONVERSIONS, FUNCTIONS, OPERATOR_KEYS, OPERATORS, TYPE_MAPPING, WGSL_TO_GLSL_BUILTIN } from './const'
import { is, isFloat32 } from '../../helpers'
import { storageSize } from '../../webgl/utils'
import type { Constants as C, Conversions, Functions, NodeContext, Operators, Swizzles, X, Y } from '../types'

export const isSwizzle = (key: unknown): key is Swizzles => {
        return is.str(key) && /^[xyzwrgbastpq]{1,4}$/.test(key)
}

export const isOperator = (key: unknown): key is Operators => {
        return OPERATOR_KEYS.includes(key as Operators)
}

export const isFunction = (key: unknown): key is Functions => {
        return FUNCTIONS.includes(key as Functions)
}

export const isElement = (x: unknown): x is Element => {
        if (is.obj(x)) return false
        return x instanceof Element
}

export const isConversion = (key: unknown): key is Conversions => {
        return CONVERSIONS.includes(key as Conversions)
}

export const isX = (x: unknown): x is X => {
        if (!x) return false
        if (typeof x !== 'object') return false // @ts-ignore
        return x.isProxy
}

export const isConstants = (type?: unknown): type is C => {
        if (!is.str(type)) return false
        return CONSTANTS.includes(type as any)
}

export const hex2rgb = (hex: number) => {
        const r = ((hex >> 16) & 0xff) / 255
        const g = ((hex >> 8) & 0xff) / 255
        const b = (hex & 0xff) / 255
        return [r, g, b]
}

let count = 0

export const getId = () => `x${count++}`

export const getBluiltin = (c: NodeContext, id: string) => {
        if (id === 'global_invocation_id') {
                const size = storageSize(c.gl?.particleCount)
                return `uvec3(uint(gl_FragCoord.y) * uint(${size.x}) + uint(gl_FragCoord.x), 0u, 0u)`
        }
        const ret = WGSL_TO_GLSL_BUILTIN[id as keyof typeof WGSL_TO_GLSL_BUILTIN]
        if (!ret) throw new Error(`Error: unknown builtin variable ${id}`)
        return ret
}

export const getConversions = <T extends C>(x: T, c?: NodeContext) => {
        if (!is.str(x)) return ''
        if (c?.isWebGL) return x
        return TYPE_MAPPING[x as keyof typeof TYPE_MAPPING] || x // for struct type
}

export const getOperator = (op: Y) => {
        return OPERATORS[op as keyof typeof OPERATORS] || op
}

export const getConstant = (conversionKey: string): C => {
        const index = CONVERSIONS.indexOf(conversionKey as Conversions)
        return index !== -1 ? CONSTANTS[index] : 'float'
}

export const initNodeContext = (c: NodeContext) => {
        if (c.code) return c
        c.code = {
                headers: new Map(),
                fragInputs: new Map(),
                vertInputs: new Map(),
                vertOutputs: new Map(),
                vertVaryings: new Map(),
                computeInputs: new Map(),
                dependencies: new Map(),
                structStructFields: new Map(),
        }
        if (c.isWebGL) return c
        c.code.fragInputs.set('position', '@builtin(position) position: vec4f')
        c.code.vertOutputs.set('position', '@builtin(position) position: vec4f')
        return c
}

export const isArrayAccess = (key: unknown): boolean => {
        return is.num(key) || (is.str(key) && /^\d+$/.test(key))
}

export const addDependency = (c: NodeContext, id = '', type: string) => {
        if (!c.code?.dependencies?.has(id)) c.code!.dependencies.set(id, new Set())
        if (!isConstants(type)) c.code!.dependencies.get(id)!.add(type)
}

/**
 * uniform ant attribute event listeners
 */
const getEventFun = (c: NodeContext, id: string, type: string) => {
        if (c.isWebGL) {
                if (type === 'attribute') return c.gl?.attribute?.bind(null, id as any)
                if (type === 'instance') return c.gl?.instance?.bind(null, id as any)
                if (type === 'texture') return c.gl?.texture?.bind(null, id as any)
                if (type === 'storage') return c.gl?.storage?.bind(null, id as any)
                return (value: any) => c.gl?.uniform?.(id, value)
        }
        if (type === 'attribute') return c.gl?._attribute?.bind(null, id)
        if (type === 'instance') return c.gl?._instance?.bind(null, id)
        if (type === 'texture') return c.gl?._texture?.bind(null, id)
        if (type === 'storage') return c.gl?._storage?.bind(null, id)
        return (value: any) => c.gl?._uniform?.(id, value)
}

const safeEventCall = <T extends C>(x: X<T>, fun: (value: any) => void) => {
        if (is.und(x)) return
        if (!isX(x)) return fun(x) // for uniform(0) or uniform([0, 1])
        if (x.type !== 'conversion') return
        const args = x.props.children?.slice(1)
        if (is.und(args?.[0])) return // ignore if uniform(vec2())
        if (is.arr(args[0])) return fun(args[0]) // for attribute(vec2([0, 0.73, -1, -1, 1, -1]))
        if (isFloat32(args[0])) return fun(args[0]) // for storage(float(new Float32Array(1024)))
        fun(args.map((x) => x ?? args[0])) // for uniform(vec2(1)) or uniform(vec2(1, 1))
}

export const setupEvent = (c: NodeContext, id: string, type: string, target: X, child: X) => {
        const fun = getEventFun(c, id, type)
        if (!fun) return
        safeEventCall(child, fun)
        target.listeners.add(fun)
        return fun
}
