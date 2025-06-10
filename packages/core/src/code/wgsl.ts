import type { Node, NodeType, NodeProxy, ConversionContext } from '../node'

// WGSLコード生成コンテキスト
interface WGSLContext extends ConversionContext {
        target: 'webgpu'
}

// ノードからWGSLコードを生成
export const nodeToWGSL = (
        nodeProxy: NodeProxy,
        context?: Partial<WGSLContext>
): string => {
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
        if (node.value !== undefined)
                return formatWGSLValue(node.value, node.type)

        // プロパティアクセス（スウィズル）
        if (node.property && node.parent) {
                const parentExpr = generateWGSLExpression(node.parent, context)
                return `${parentExpr}.${node.property}`
        }

        // 演算子ノード
        if (node.operator && node.children && node.children.length >= 2)
                return generateWGSLOperator(node, context)

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
        if (Array.isArray(value)) {
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
        const args = node.children.map((child) =>
                generateWGSLExpression(child, context)
        )
        const [x, y, z] = args

        // 単項関数
        if (args.length === 1) {
                if (fun === 'abs') return `abs(${x})`
                if (fun === 'acos') return `acos(${x})`
                if (fun === 'asin') return `asin(${x})`
                if (fun === 'atan') return `atan(${x})`
                if (fun === 'ceil') return `ceil(${x})`
                if (fun === 'cos') return `cos(${x})`
                if (fun === 'floor') return `floor(${x})`
                if (fun === 'fract') return `fract(${x})`
                if (fun === 'length') return `length(${x})`
                if (fun === 'normalize') return `normalize(${x})`
                if (fun === 'sin') return `sin(${x})`
                if (fun === 'sqrt') return `sqrt(${x})`
                if (fun === 'tan') return `tan(${x})`
        }

        // 二項関数
        if (args.length === 2) {
                if (fun === 'atan2') return `atan2(${x}, ${y})`
                if (fun === 'pow') return `pow(${x}, ${y})`
                if (fun === 'min') return `min(${x}, ${y})`
                if (fun === 'max') return `max(${x}, ${y})`
                if (fun === 'dot') return `dot(${x}, ${y})`
                if (fun === 'cross') return `cross(${x}, ${y})`
                if (fun === 'distance') return `distance(${x}, ${y})`
                if (fun === 'reflect') return `reflect(${x}, ${y})`
        }

        // 三項関数
        if (args.length === 3) {
                if (fun === 'mix') return `mix(${x}, ${y}, ${z})`
                if (fun === 'clamp') return `clamp(${x}, ${y}, ${z})`
                if (fun === 'smoothstep') return `smoothstep(${x}, ${y}, ${z})`
                return x
        }

        return x || '0.0'
}

// 完全なWGSLシェーダーを生成
export const wgsl = (
        fragmentNode: NodeProxy,
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
        if (typeof value === 'number') return 'f32'
        if (typeof value === 'boolean') return 'bool'
        if (Array.isArray(value)) {
                const len = value.length
                if (len === 2) return 'vec2<f32>'
                if (len === 3) return 'vec3<f32>'
                if (len === 4) return 'vec4<f32>'
        }
        return 'f32'
}
