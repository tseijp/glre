import type { NodeType, Operator, MathFunction, Swillzes } from './const'

// ノードの基本インターフェース
export interface Node {
        id: string
        type: NodeType
        value?: any
        property?: string
        parent?: Node
        children?: Node[]
        operator?: Operator
        mathFunction?: MathFunction
}

// Proxyハンドラーのコールバック型
export interface ProxyCallback {
        path: string[]
        args: any[]
}

// ノード作成関数の型
export type NodeCreator = (value?: any) => X

// 演算子メソッドの型
export interface OperatorMethods {
        add(x: X | number): X
        sub(x: X | number): X
        mul(x: X | number): X
        div(x: X | number): X
        mod(x: X | number): X
        equal(x: X | number): X
        notEqual(x: X | number): X
        lessThan(x: X | number): X
        lessThanEqual(x: X | number): X
        greaterThan(x: X | number): X
        greaterThanEqual(x: X | number): X
        and(x: X): X
        or(x: X): X
        not(): X
}

// 数学関数メソッドの型
export interface MathMethods {
        abs(): X
        acos(): X
        asin(): X
        atan(): X
        ceil(): X
        cos(): X
        floor(): X
        fract(): X
        length(): X
        normalize(): X
        sin(): X
        sqrt(): X
        tan(): X
        toVar(): X
}

// 全てのswizzleパターンをまとめる型

// スウィズルプロパティの型
export type SwizzleProperties = {
        [k in Swillzes]: X
}

// ノードProxy型
export interface X extends MathMethods, OperatorMethods, SwizzleProperties {
        readonly id: string
        readonly type: NodeType
        readonly value: any
        readonly property: string
        (...args: any[]): X
}

// ユニフォーム変数の型
export interface UniformNode extends X {
        set(value: any): void
        onObjectUpdate(callback: (context: any) => any): UniformNode
        onRenderUpdate(callback: (context: any) => any): UniformNode
}

// 関数定義の型
export interface FunctionNode {
        (...args: any[]): X
        call(x: X[]): X
}

// 条件分岐の型
export interface ConditionalNode {
        ElseIf(condition: X, callback: () => void): ConditionalNode
        Else(callback: () => void): void
}

// WebGL/WebGPU変換コンテキスト
export interface ConversionContext {
        target: 'webgl' | 'webgpu'
        nodes: Map<string, Node>
        variables: Map<string, string>
        functions: Map<string, string>
}
