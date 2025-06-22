import { code } from './code'
import { assign, toVar, toConst } from './scope'
import { getId, isFunction, isOperator, isSwizzle } from './utils'
import type { Functions, NodeProps, NodeProxy, NodeTypes, Operators, Swizzles, X } from './types'

const toPrimitive = (x: X) => {
        return (hint: string) => {
                if (hint === 'string') return code(x)
        }
}

export const node = (type: NodeTypes, props?: NodeProps | null, ...args: X[]) => {
        if (!props) props = {}
        if (args.length) props.children = args
        const x = new Proxy(() => {}, {
                get(_, key) {
                        if (key === 'type') return type
                        if (key === 'props') return props
                        if (key === 'toVar') return toVar(x)
                        if (key === 'toConst') return toConst(x)
                        if (key === 'assign') return assign(x)
                        if (key === 'isProxy') return true
                        if (key === 'toString') return code.bind(null, x)
                        if (key === Symbol.toPrimitive) return toPrimitive(x)
                        if (isSwizzle(key)) return s(key, x)
                        if (isOperator(key)) return (...y: X[]) => o(key, x, ...y)
                        if (isFunction(key)) return (...y: X[]) => f(key, x, ...y)
                        // Type conversion methods
                        if (key === 'toFloat') return () => n('float', x)
                        if (key === 'toInt') return () => n('int', x)
                        if (key === 'toUint') return () => n('uint', x)
                        if (key === 'toBool') return () => n('bool', x)
                        if (key === 'toVec2') return () => n('vec2', x)
                        if (key === 'toVec3') return () => n('vec3', x)
                        if (key === 'toVec4') return () => n('vec4', x)
                        if (key === 'toIvec2') return () => n('ivec2', x)
                        if (key === 'toIvec3') return () => n('ivec3', x)
                        if (key === 'toIvec4') return () => n('ivec4', x)
                        if (key === 'toUvec2') return () => n('uvec2', x)
                        if (key === 'toUvec3') return () => n('uvec3', x)
                        if (key === 'toUvec4') return () => n('uvec4', x)
                        if (key === 'toBvec2') return () => n('bvec2', x)
                        if (key === 'toBvec3') return () => n('bvec3', x)
                        if (key === 'toBvec4') return () => n('bvec4', x)
                        if (key === 'toMat2') return () => n('mat2', x)
                        if (key === 'toMat3') return () => n('mat3', x)
                        if (key === 'toMat4') return () => n('mat4', x)
                        if (key === 'toColor') return () => n('vec3', x)
                        return toVar(x)('')
                },
                set(_, key, value) {
                        if (isSwizzle(key)) {
                                s(key, x).assign(value)
                                return true
                        }
                        return false
                },
        }) as unknown as NodeProxy
        return x
}

// Node shorthands
export const v = (...args: X[]) => node('variable', { id: getId() }, ...args)
export const u = (id: string, defaultValue?: number | number[] | boolean) => node('uniform', { id, defaultValue })
export const s = (key: Swizzles, arg: X) => node('swizzle', null, key, arg)
export const n = (key: string, ...args: X[]) => node('node_type', null, key, ...args)
export const o = (key: Operators, ...args: X[]) => node('operator', null, key, ...args)
export const f = (key: Functions, ...args: X[]) => node('math_fun', null, key, ...args)

export const select = (x: X, y: X, z: X) => node('ternary', null, x, y, z)
