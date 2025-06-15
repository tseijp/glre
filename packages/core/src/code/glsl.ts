import { is } from './../utils/helpers'
import type { Node, NodeType, X, ConversionContext } from '../node'

// GLSLコード生成コンテキスト
interface GLSLContext extends ConversionContext {
        target: 'webgl'
        precision: 'lowp' | 'mediump' | 'highp'
        version: '100' | '300 es'
}

// ノードからGLSLコードを生成
export const nodeToGLSL = (nodeProxy: X, context?: Partial<GLSLContext>): string => {
        const ctx: GLSLContext = {
                target: 'webgl',
                precision: 'mediump',
                version: '300 es',
                nodes: new Map(),
                variables: new Map(),
                functions: new Map(),
                ...context,
        }

        return generateGLSLExpression(nodeProxy as any, ctx)
}

// GLSL式を生成
const generateGLSLExpression = (node: Node, context: GLSLContext): string => {
        if (!node) return '0.0'
        // 値ノード
        if (!is.und(node.value)) return formatGLSLValue(node.value, node.type)
        // プロパティアクセス（スウィズル）
        if (node.property && node.parent) {
                const parentExpr = generateGLSLExpression(node.parent, context)
                return `${parentExpr}.${node.property}`
        }
        // 演算子ノード
        if (node.operator && node.children && node.children.length >= 2) return generateGLSLOperator(node, context)
        // 数学関数ノード
        if (node.mathFunction && node.children && node.children.length >= 1)
                return generateGLSLMathFunction(node, context)
        return '0.0'
}

// GLSL値をフォーマット
const formatGLSLValue = (value: any, type: NodeType): string => {
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
                if (type === 'vec2') return `vec2(${values})`
                if (type === 'vec3') return `vec3(${values})`
                if (type === 'vec4') return `vec4(${values})`
                if (type === 'color') return `vec3(${values})`
        }
        return '0.0'
}

// GLSL演算子を生成
const generateGLSLOperator = (node: Node, context: GLSLContext): string => {
        if (!node.children || node.children.length < 2) return '0.0'
        const left = generateGLSLExpression(node.children[0], context)
        const right = generateGLSLExpression(node.children[1], context)
        if (node.operator === 'add') return `(${left} + ${right})`
        if (node.operator === 'sub') return `(${left} - ${right})`
        if (node.operator === 'mul') return `(${left} * ${right})`
        if (node.operator === 'div') return `(${left} / ${right})`
        if (node.operator === 'mod') return `mod(${left}, ${right})`
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

// GLSL数学関数を生成
const generateGLSLMathFunction = (node: Node, context: GLSLContext): string => {
        if (!node.children || node.children.length < 1) return '0.0'
        const fun = node.mathFunction
        const args = node.children.map((child) => {
                return generateGLSLExpression(child, context)
        })
        const [x, y, z] = args
        // @TODO FIX
        // if (fun === 'toVar') return x // toVarは変数化のヒントなので、そのまま返す
        if (args.length === 1) return `${fun}(${x})`
        if (args.length === 2) return `${fun}(${x}, ${y})`
        if (args.length === 3) return `${fun}(${x}, ${y}, ${z})`
        return x || '0.0'
}

// 値からGLSL型を推定
const inferGLSLType = (value: unknown): string => {
        if (is.num(value)) return 'float'
        if (is.bol(value)) return 'bool'
        if (is.arr(value)) {
                const len = value.length
                if (len === 2) return 'vec2'
                if (len === 3) return 'vec3'
                if (len === 4) return 'vec4'
        }
        return 'float'
}

// 完全なGLSLシェーダーを生成
export const glsl = (
        fragmentNode: X,
        options?: {
                precision?: 'lowp' | 'mediump' | 'highp'
                version?: '100' | '300 es'
                uniforms?: Record<string, any>
        }
) => {
        const precision = options?.precision || 'mediump'
        const version = options?.version || '300 es'
        const is300ES = version === '300 es'
        const fragment = nodeToGLSL(fragmentNode)
        let shader = ''
        if (is300ES) shader += '#version 300 es\n'
        shader += `precision ${precision} float;\n\n`
        // ユニフォーム変数の追加
        if (options?.uniforms) {
                Object.entries(options.uniforms).forEach(([name, value]) => {
                        const type = inferGLSLType(value)
                        shader += `uniform ${type} ${name};\n`
                })
                shader += '\n'
        }
        // 出力変数
        if (is300ES) shader += 'out vec4 fragColor;\n\n'
        shader += 'void main() {\n'
        shader += is300ES ? `    fragColor = ${fragment};\n` : `    gl_FragColor = ${fragment};\n`
        shader += '}\n'

        return shader
}
