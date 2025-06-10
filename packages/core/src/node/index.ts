import { node } from './node'
import { uniform } from './uniform'
import { float } from './conv'
import type { NodeProxy, FunctionNode, ConditionalNode } from './types'

export { uniform }

export type { NodeProxy, FunctionNode, ConditionalNode }
export { node }

// 関数定義
export const Fn = (jsFunc: Function): FunctionNode => {
        const functionNode = (...args: any[]) => {
                const inputs = args.map((arg) => {
                        if (typeof arg === 'object' && arg.type) return arg
                        return float(arg)
                })

                const result = jsFunc(inputs)
                return result || float(0)
        }

        functionNode.call = (inputs: NodeProxy[]) => {
                return jsFunc(inputs)
        }

        return functionNode as FunctionNode
}

// 条件分岐
export const If = (
        condition: NodeProxy,
        callback: () => void
): ConditionalNode => {
        callback()

        const conditionalNode = {
                ElseIf(
                        newCondition: NodeProxy,
                        newCallback: () => void
                ): ConditionalNode {
                        newCallback()
                        return conditionalNode
                },
                Else(elseCallback: () => void) {
                        elseCallback()
                },
        }

        return conditionalNode
}

// 組み込み変数
export const gl_FragCoord = node('vec4', undefined)
export const gl_Position = node('vec4', undefined)
export const iTime = uniform(0.0)
export const iResolution = uniform([1920, 1080])
export const iMouse = uniform([0, 0])

// 数学関数
export const abs = (x: NodeProxy) => x.abs()
export const sin = (x: NodeProxy) => x.sin()
export const cos = (x: NodeProxy) => x.cos()
export const tan = (x: NodeProxy) => x.tan()
export const sqrt = (x: NodeProxy) => x.sqrt()
export const floor = (x: NodeProxy) => x.floor()
export const ceil = (x: NodeProxy) => x.ceil()
export const fract = (x: NodeProxy) => x.fract()
export const normalize = (x: NodeProxy) => x.normalize()
export const length = (x: NodeProxy) => x.length()

/**
 * @TODO FIX
export const min = (a: NodeProxy, b: NodeProxy) => {
        return node('float', undefined, {
                mathFunction: 'min',
                children: [a as any, b as any],
        })
}

export const max = (a: NodeProxy, b: NodeProxy) => {
        return node('float', undefined, {
                mathFunction: 'max',
                children: [a as any, b as any],
        })
}

export const mix = (a: NodeProxy, b: NodeProxy, t: NodeProxy) => {
        return node('float', undefined, {
                mathFunction: 'mix',
                children: [a as any, b as any, t as any],
        })
}

export const clamp = (x: NodeProxy, min: NodeProxy, max: NodeProxy) => {
        return node('float', undefined, {
                mathFunction: 'clamp',
                children: [x as any, min as any, max as any],
        })
}
*/

export * from './const'
export * from './conv'
export * from './node'
export * from './types'
export * from './uniform'
