import { CACHE_BOOLS, CACHE_INTS, CACHE_FLOATS } from './const'
import { node } from '.'
import type { NodeProxy } from './types'

const boolCache = new Map<boolean, NodeProxy>()
const intCache = new Map<number, NodeProxy>()
const floatCache = new Map<number, NodeProxy>()

const initializeCache = () => {
        CACHE_BOOLS.forEach((value) => {
                boolCache.set(value, node('bool', value))
        })
        CACHE_INTS.forEach((value) => {
                intCache.set(value, node('int', value))
        })
        CACHE_FLOATS.forEach((value) => {
                floatCache.set(value, node('float', value))
        })
}

export const getCachedBool = (value: boolean): NodeProxy => {
        if (!boolCache.has(value)) initializeCache()
        return boolCache.get(value) || node('bool', value)
}

// キャッシュされたintノードを取得
export const getCachedInt = (value: number): NodeProxy => {
        if (intCache.has(value)) return intCache.get(value)!
        return node('int', value)
}

// キャッシュされたfloatノードを取得
export const getCachedFloat = (value: number): NodeProxy => {
        if (floatCache.has(value)) return floatCache.get(value)!
        return node('float', value)
}

// ノードの重複を検出
export const findDuplicateNodes = (
        nodes: NodeProxy[]
): Map<string, NodeProxy[]> => {
        const duplicates = new Map<string, NodeProxy[]>()
        const signatures = new Map<string, NodeProxy>()

        nodes.forEach((nodeProxy) => {
                const signature = generateNodeSignature(nodeProxy)
                if (signatures.has(signature)) {
                        if (!duplicates.has(signature))
                                duplicates.set(signature, [
                                        signatures.get(signature)!,
                                ])
                        duplicates.get(signature)!.push(nodeProxy)
                } else signatures.set(signature, nodeProxy)
        })
        return duplicates
}

// ノードのシグネチャを生成
const generateNodeSignature = (nodeProxy: NodeProxy): string => {
        const parts = [
                nodeProxy.type,
                `${nodeProxy.value}`,
                nodeProxy.property || '',
        ]
        return parts.join('|')
}

// 初期化を実行
initializeCache()
