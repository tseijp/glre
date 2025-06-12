import { CACHE_BOOLS, CACHE_INTS, CACHE_FLOATS } from './const'
import { node } from '.'
import type { X } from './types'

const boolCache = new Map<boolean, X>()
const intCache = new Map<number, X>()
const floatCache = new Map<number, X>()

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

export const getCachedBool = (x: boolean): X => {
        if (!boolCache.has(x)) initializeCache()
        return boolCache.get(x) || node('bool', x)
}

// キャッシュされたintノードを取得
export const getCachedInt = (x: number): X => {
        if (intCache.has(x)) return intCache.get(x)!
        return node('int', x)
}

// キャッシュされたfloatノードを取得
export const getCachedFloat = (x: number): X => {
        if (floatCache.has(x)) return floatCache.get(x)!
        return node('float', x)
}

// ノードの重複を検出
export const findDuplicateNodes = (nodes: X[]): Map<string, X[]> => {
        const duplicates = new Map<string, X[]>()
        const signatures = new Map<string, X>()

        nodes.forEach((nodeProxy) => {
                const signature = generateNodeSignature(nodeProxy)
                if (signatures.has(signature)) {
                        if (!duplicates.has(signature)) duplicates.set(signature, [signatures.get(signature)!])
                        duplicates.get(signature)!.push(nodeProxy)
                } else signatures.set(signature, nodeProxy)
        })
        return duplicates
}

// ノードのシグネチャを生成
const generateNodeSignature = (nodeProxy: X): string => {
        const parts = [nodeProxy.type, `${nodeProxy.value}`, nodeProxy.property || '']
        return parts.join('|')
}

// 初期化を実行
// initializeCache()
