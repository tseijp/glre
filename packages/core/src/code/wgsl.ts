import { is } from '../utils/helpers'
import type { Node, NodeType, ConversionContext, X } from '../node'

// WGSLコード生成コンテキスト
interface WGSLContext extends ConversionContext {
        target: 'webgpu'
}

// ノードからWGSLコードを生成
export const nodeToWGSL = (nodeProxy: X, context?: Partial<WGSLContext>): string => {
        const ctx: WGSLContext = {
                target: 'webgpu',
                nodes: new Map(),
                variables: new Map(),
                functions: new Map(),
                ...context,
        }
        return generateWGSLExpression(nodeProxy as any, ctx)
}

// WGSL式を生成
const generateWGSLExpression = (node: Node, context: WGSLContext): string => {
        if (!node) return '0.0'
        // 値ノード
        if (node.value !== undefined) return formatWGSLValue(node.value, node.type)
        // プロパティアクセス（スウィズル）
        if (node.property && node.parent) {
                const parentExpr = generateWGSLExpression(node.parent, context)
                return `${parentExpr}.${node.property}`
        }
        // 演算子ノード
        if (node.operator && node.children && node.children.length >= 2) return generateWGSLOperator(node, context)
        // 数学関数ノード
        if (node.mathFunction && node.children && node.children.length >= 1)
                return generateWGSLMathFunction(node, context)
        return '0.0'
}

// WGSL値をフォーマット
const formatWGSLValue = (value: any, type: NodeType): string => {
        if (type === 'float') {
                const num = Number(value)
                return num % 1 === 0 ? `${num}.0` : `${num}`
        }
        if (type === 'int') return `${Math.floor(Number(value))}`
        if (type === 'bool') return Boolean(value) ? 'true' : 'false'
        if (is.arr(value)) {
                const values = value
                        .map((v) => {
                                const num = Number(v)
                                return num % 1 === 0 ? `${num}.0` : `${num}`
                        })
                        .join(', ')
                if (type === 'vec2') return `vec2<f32>(${values})`
                if (type === 'vec3') return `vec3<f32>(${values})`
                if (type === 'vec4') return `vec4<f32>(${values})`
                if (type === 'color') return `vec3<f32>(${values})`
        }

        return '0.0'
}

// WGSL演算子を生成
const generateWGSLOperator = (node: Node, context: WGSLContext): string => {
        if (!node.children || node.children.length < 2) return '0.0'
        const left = generateWGSLExpression(node.children[0], context)
        const right = generateWGSLExpression(node.children[1], context)
        if (node.operator === 'add') return `(${left} + ${right})`
        if (node.operator === 'sub') return `(${left} - ${right})`
        if (node.operator === 'mul') return `(${left} * ${right})`
        if (node.operator === 'div') return `(${left} / ${right})`
        if (node.operator === 'mod') return `(${left} % ${right})`
        if (node.operator === 'equal') return `(${left} == ${right})`
        if (node.operator === 'notEqual') return `(${left} != ${right})`
        if (node.operator === 'lessThan') return `(${left} < ${right})`
        if (node.operator === 'lessThanEqual') return `(${left} <= ${right})`
        if (node.operator === 'greaterThan') return `(${left} > ${right})`
        if (node.operator === 'greaterThanEqual') return `(${left} >= ${right})`
        if (node.operator === 'and') return `(${left} && ${right})`
        if (node.operator === 'or') return `(${left} || ${right})`
        return `(${left} + ${right})`
}

// WGSL数学関数を生成
const generateWGSLMathFunction = (node: Node, context: WGSLContext): string => {
        if (!node.children || node.children.length < 1) return '0.0'
        const fun = node.mathFunction
        const args = node.children.map((child) => generateWGSLExpression(child, context))
        const [x, y, z] = args
        // @TODO FIX
        // if (fun === 'toVar') return x // toVarは変数化のヒントなので、そのまま返す
        if (args.length === 1) return `${fun}(${x})`
        if (args.length === 2) return `${fun}(${x}, ${y})`
        if (args.length === 3) return `${fun}(${x}, ${y}, ${z})`
        return x || '0.0'
}

// 完全なWGSLシェーダーを生成
export const wgsl = (
        fragmentNode: X,
        options?: {
                uniforms?: Record<string, any>
        }
) => {
        let shader = ''
        // ユニフォーム変数の追加
        if (options?.uniforms) {
                Object.entries(options.uniforms).forEach(([name, value]) => {
                        const type = inferWGSLType(value)
                        shader += `@group(0) @binding(0) var<uniform> ${name}: ${type};\n`
                })
                shader += '\n'
        }
        shader += '@fragment\n'
        shader += 'fn main() -> @location(0) vec4<f32> {\n'
        const fragmentExpr = nodeToWGSL(fragmentNode)
        shader += `    return ${fragmentExpr};\n`
        shader += '}\n'

        return shader
}

// 値からWGSL型を推定
const inferWGSLType = (value: any): string => {
        if (is.num(value)) return 'f32'
        if (is.bol(value)) return 'bool'
        if (is.arr(value)) {
                const len = value.length
                if (len === 2) return 'vec2<f32>'
                if (len === 3) return 'vec3<f32>'
                if (len === 4) return 'vec4<f32>'
        }
        return 'f32'
}
