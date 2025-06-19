import { is } from '../utils/helpers'
import { isFunction, isOperator, isSwizzle, isType, OPERATORS } from './const'
import type { X, NodeProps, NodeChild } from './types'
export * from './const'
export * from './types'

let isWGSL = false

export const setContext = (target: 'glsl' | 'wgsl') => {
        isWGSL = target === 'wgsl'
}

export const node = (type: string, props?: NodeProps | null, ...args: NodeChild[]): X => {
        if (!props) props = {} as NodeProps
        const { value, children, ...other } = props
        if (!args.length) args = is.arr(children) ? children : [children]
        const data = { type, value, children: args, ...other }
        return new Proxy(() => {}, {
                get(_, key) {
                        if (key === Symbol.toPrimitive) return primitiveConverter(data)
                        if (key === 'toString') return () => convertToShader(data)
                        if (key === 'toVar') return () => createVarNode(data)
                        if (isOperator(key) || isFunction(key) || isType(key))
                                return (...args: any[]) => node(key, {}, ...args)
                        return key
                },
        }) as unknown as X
}

const primitiveConverter = (data: any) => {
        return (hint: string) => {
                if (hint === 'string' || hint === 'default') return convertToShader(data)
        }
}

const createVarNode = (data: any) => {
        return node('variable', { id: data.id, value: 'var' }, data)
}

const convertToShader = (data: any): string => {
        if (is.num(data)) return data.toFixed(1)
        if (is.str(data)) return data

        const { type, value, children } = data

        // if (type === 'literal') return String(children?.[0] ?? '')
        if (type === 'uniform') return children[0]
        // if (type === 'variable') return id
        if (value === 'swizzle') return `${convertToShader(children[0])}.${type}`

        if (isOperator(type)) {
                const op = OPERATORS[type as keyof typeof OPERATORS]
                if (!op) return type

                if (type === 'not' || type === 'bitNot') {
                        return `${op}${convertToShader(children[0])}`
                }
                return `(${convertToShader(children[0])} ${op} ${convertToShader(children[1])})`
        }

        if (isType(type)) {
                const func = isWGSL && type.startsWith('vec') ? `${type}f` : type
                const args = children.map(convertToShader).join(', ')
                return `${func}(${args})`
        }

        if (isFunction(type)) {
                const args = children.map(convertToShader).join(', ')
                return `${type}(${args})`
        }

        return type
}

const uniform = (name: string, defaultValue?: any): X => node('uniform', { value: defaultValue }, name)
export const iResolution = uniform('iResolution', [1280, 800])
export const iMouse = uniform('iMouse', [0, 0])
export const iTime = uniform('iTime', 0)
export const fragCoord = node('gl_FragCoord')
