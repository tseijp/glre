import type { NodeType, Operator, MathFunction } from './const'

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
export type NodeCreator = (value?: any) => NodeProxy

// 演算子メソッドの型
export interface OperatorMethods {
        add(other: NodeProxy | number): NodeProxy
        sub(other: NodeProxy | number): NodeProxy
        mul(other: NodeProxy | number): NodeProxy
        div(other: NodeProxy | number): NodeProxy
        mod(other: NodeProxy | number): NodeProxy
        equal(other: NodeProxy | number): NodeProxy
        notEqual(other: NodeProxy | number): NodeProxy
        lessThan(other: NodeProxy | number): NodeProxy
        lessThanEqual(other: NodeProxy | number): NodeProxy
        greaterThan(other: NodeProxy | number): NodeProxy
        greaterThanEqual(other: NodeProxy | number): NodeProxy
        and(other: NodeProxy): NodeProxy
        or(other: NodeProxy): NodeProxy
        not(): NodeProxy
}

// 数学関数メソッドの型
export interface MathMethods {
        abs(): NodeProxy
        acos(): NodeProxy
        asin(): NodeProxy
        atan(): NodeProxy
        ceil(): NodeProxy
        cos(): NodeProxy
        floor(): NodeProxy
        fract(): NodeProxy
        length(): NodeProxy
        normalize(): NodeProxy
        sin(): NodeProxy
        sqrt(): NodeProxy
        tan(): NodeProxy
        toVar(): NodeProxy
}

// スウィズルプロパティの型
export interface SwizzleProperties {
        x: NodeProxy
        y: NodeProxy
        z: NodeProxy
        w: NodeProxy
        r: NodeProxy
        g: NodeProxy
        b: NodeProxy
        a: NodeProxy
        xy: NodeProxy
        xyz: NodeProxy
        rgba: NodeProxy
}

// ノードProxy型
export interface NodeProxy
        extends OperatorMethods,
                MathMethods,
                Partial<SwizzleProperties> {
        readonly id: string
        readonly type: NodeType
        readonly value?: any
        readonly property?: string
        (...args: any[]): NodeProxy
}

// ユニフォーム変数の型
export interface UniformNode extends NodeProxy {
        set(value: any)
        onObjectUpdate(callback: (context: any) => any): UniformNode
        onRenderUpdate(callback: (context: any) => any): UniformNode
}

// 関数定義の型
export interface FunctionNode {
        (...args: any[]): NodeProxy
        call(inputs: NodeProxy[]): NodeProxy
}

// 条件分岐の型
export interface ConditionalNode {
        ElseIf(condition: NodeProxy, callback: () => void): ConditionalNode
        Else(callback: () => void)
}

// シェーダーコード生成の型
export interface ShaderCode {
        vertex?: string
        fragment?: string
        uniforms?: Record<string, any>
        attributes?: Record<string, any>
}

// WebGL/WebGPU変換コンテキスト
export interface ConversionContext {
        target: 'webgl' | 'webgpu'
        nodes: Map<string, Node>
        variables: Map<string, string>
        functions: Map<string, string>
}
