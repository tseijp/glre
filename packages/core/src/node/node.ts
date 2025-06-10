import { OPERATORS, FUNCTIONS, SWIZZLES, NodeType } from './const'
import type { Node, NodeProxy, ProxyCallback } from './types'

let nodeIdCounter = 0

// ノードIDを生成
const generateNodeId = () => `node_${++nodeIdCounter}`

// ノードを作成
export const createNode = (
        type: NodeType,
        value?: any,
        options?: Partial<Node>
): Node => {
        return {
                id: generateNodeId(),
                type,
                value,
                children: [],
                ...options,
        }
}

const isSwizzleProperty = (key = '') => SWIZZLES.includes(key as any)
const isOperatorMethod = (key = '') => OPERATORS.includes(key as any)
const isMathMethod = (key = '') => FUNCTIONS.includes(key as any)

// Proxyハンドラーを作成
const createNodeProxy = (
        node: Node,
        callback?: (info: ProxyCallback) => NodeProxy
) => {
        const get = (_target: unknown, key: unknown) => {
                if (typeof key !== 'string' || key === 'then') return undefined

                if (key === 'id') return node.id
                if (key === 'type') return node.type
                if (key === 'value') return node.value
                if (key === 'property') return node.property

                // swizzle prooerty
                if (isSwizzleProperty(key))
                        return createNodeProxy(
                                createNode(getSwizzleType(key), undefined, {
                                        parent: node,
                                        property: key,
                                }),
                                callback
                        )

                // 演算子メソッド
                if (isOperatorMethod(key))
                        return (...args: any[]) => {
                                return createNodeProxy(
                                        createNode(node.type, undefined, {
                                                operator: key as any,
                                                children: [node, ...args],
                                        }),
                                        callback
                                )
                        }

                // 数学関数メソッド
                if (isMathMethod(key))
                        return (...args: any[]) => {
                                return createNodeProxy(
                                        createNode(
                                                getMathReturnType(
                                                        key,
                                                        node.type
                                                ),
                                                undefined,
                                                {
                                                        mathFunction:
                                                                key as any,
                                                        children: [
                                                                node,
                                                                ...args,
                                                        ],
                                                }
                                        ),
                                        callback
                                )
                        }

                return callback?.({ path: [key], args: [] })
        }
        const apply = (_target: unknown, _thisArg: unknown, args: any) => {
                return callback?.({ path: [], args })
        }

        return new Proxy(() => {}, { get, apply }) as NodeProxy
}

// スウィズルの戻り値型を取得
const getSwizzleType = (swizzle: string): NodeType => {
        if (swizzle.length === 1) return 'float'
        if (swizzle.length === 2) return 'vec2'
        if (swizzle.length === 3) return 'vec3'
        if (swizzle.length === 4) return 'vec4'
        return 'float'
}

// 数学関数の戻り値型を取得
const getMathReturnType = (func: string, inputType: NodeType): NodeType => {
        if (func === 'length') return 'float'
        if (func === 'normalize') return inputType
        if (func === 'toVar') return inputType
        return inputType
}

// 公開API
export const node = (
        type: NodeType,
        value?: any,
        options?: Partial<Node>
): NodeProxy => {
        const nodeInstance = createNode(type, value, options)
        return createNodeProxy(nodeInstance)
}
