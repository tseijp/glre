import { node } from './node'
import { uniform } from './uniform'
import { float } from './conv'
import { is } from '../utils'
import type { X, FunctionNode, ConditionalNode } from './types'
export type { X, FunctionNode, ConditionalNode }
export * from './cache'
export * from './const'
export * from './conv'
export * from './node'
export * from './types'
export * from './uniform'

// 関数定義
export const Fn = (jsFunc: Function): FunctionNode => {
        const functionNode = (...args: any[]) => {
                const inputs = args.map((arg) => {
                        if (is.obj(arg) && 'type' in arg && arg.type) return arg
                        return float(arg)
                })
                const result = jsFunc(inputs)
                return result || float(0)
        }
        functionNode.call = (inputs: X[]) => jsFunc(inputs)
        return functionNode as FunctionNode
}

// 条件分岐
export const If = (condition: X, callback: () => void): ConditionalNode => {
        callback()

        const conditionalNode = {
                ElseIf(
                        newCondition: X,
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
export const abs = (x: X) => x.abs()
export const sin = (x: X) => x.sin()
export const cos = (x: X) => x.cos()
export const tan = (x: X) => x.tan()
export const sqrt = (x: X) => x.sqrt()
export const floor = (x: X) => x.floor()
export const ceil = (x: X) => x.ceil()
export const fract = (x: X) => x.fract()
export const normalize = (x: X) => x.normalize()
export const length = (x: X) => x.length()

/**
 * @TODO FIX
export const min = (a: X, b: X) => {
        return node('float', undefined, {
                mathFunction: 'min',
                children: [a as any, b as any],
        })
}

export const max = (a: X, b: X) => {
        return node('float', undefined, {
                mathFunction: 'max',
                children: [a as any, b as any],
        })
}

export const mix = (a: X, b: X, t: X) => {
        return node('float', undefined, {
                mathFunction: 'mix',
                children: [a as any, b as any, t as any],
        })
}

export const clamp = (x: X, min: X, max: X) => {
        return node('float', undefined, {
                mathFunction: 'clamp',
                children: [x as any, min as any, max as any],
        })
}
*/
