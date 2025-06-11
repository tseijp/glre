import { node } from './node'
import { is } from '../utils'
import type { UniformNode } from './types'
import type { NodeType } from './const'

// ユニフォーム更新コンテキスト
interface UpdateContext {
        object?: any
        camera?: any
        renderer?: any
        scene?: any
        time?: number
}

// ユニフォーム値の型を推定
const inferUniformType = (value: any): NodeType => {
        if (is.num(value)) return 'float'
        if (is.bol(value)) return 'bool'
        if (is.arr(value)) {
                const len = value.length
                if (len === 2) return 'vec2'
                if (len === 3) return 'vec3'
                if (len === 4) return 'vec4'
                if (len === 9) return 'mat3'
                if (len === 16) return 'mat4'
        }
        if (is.obj(value) && 'r' in value && 'g' in value && 'b' in value)
                return 'color'
        return 'float'
}

// ユニフォーム変数を作成
export const uniform = (initialValue: any): UniformNode => {
        const type = inferUniformType(initialValue)
        let currentValue = initialValue
        let objectUpdateCallback: ((context: UpdateContext) => any) | null =
                null
        let renderUpdateCallback: ((context: UpdateContext) => any) | null =
                null

        const baseNode = node(type, currentValue) as any

        // 値を設定
        const set = (value: any) => {
                currentValue = value
                baseNode.value = value
        }
        // オブジェクト更新時のコールバックを設定
        const onObjectUpdate = (
                callback: (context: UpdateContext) => any
        ): UniformNode => {
                objectUpdateCallback = callback
                return uniformNode
        }
        // レンダー更新時のコールバックを設定
        const onRenderUpdate = (
                callback: (context: UpdateContext) => any
        ): UniformNode => {
                renderUpdateCallback = callback
                return uniformNode
        }
        // 内部更新関数（外部から呼び出される）
        const _updateFromContext = (context: UpdateContext) => {
                if (objectUpdateCallback) {
                        const newValue = objectUpdateCallback(context)
                        if (newValue !== undefined) set(newValue)
                }
                if (renderUpdateCallback) {
                        const newValue = renderUpdateCallback(context)
                        if (newValue !== undefined) set(newValue)
                }
        }
        // UniformNodeインターフェースを実装
        const uniformNode = Object.create(baseNode)
        uniformNode.set = set
        uniformNode.onObjectUpdate = onObjectUpdate
        uniformNode.onRenderUpdate = onRenderUpdate
        uniformNode._updateFromContext = _updateFromContext
        uniformNode.isUniform = true
        return uniformNode as UniformNode
}

// 組み込みユニフォーム変数
export const iTime = uniform(0.0)
export const iPrevTime = uniform(0.0)
export const iDeltaTime = uniform(0.0)
export const iResolution = uniform([1920, 1080])
export const iMouse = uniform([0, 0])

// ユニフォーム変数の更新（レンダーループで呼び出される）
export const updateUniforms = (context: UpdateContext) => {
        // 時間の更新
        if (context.time !== undefined) {
                const prevTime = iTime.value || 0
                iTime.set(context.time)
                iPrevTime.set(prevTime)
                iDeltaTime.set(context.time - prevTime)
        }
}
