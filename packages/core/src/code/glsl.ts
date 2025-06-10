import type { Node, NodeType, NodeProxy, ConversionContext } from '../node'

// GLSLコード生成コンテキスト
interface GLSLContext extends ConversionContext {
        target: 'webgl'
        precision: 'lowp' | 'mediump' | 'highp'
        version: '100' | '300 es'
}

// ノードからGLSLコードを生成
export const nodeToGLSL = (
        nodeProxy: NodeProxy,
        context?: Partial<GLSLContext>
): string => {
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
        if (node.value !== undefined) {
                return formatGLSLValue(node.value, node.type)
        }

        // プロパティアクセス（スウィズル）
        if (node.property && node.parent) {
                const parentExpr = generateGLSLExpression(node.parent, context)
                return `${parentExpr}.${node.property}`
        }

        // 演算子ノード
        if (node.operator && node.children && node.children.length >= 2) {
                return generateGLSLOperator(node, context)
        }

        // 数学関数ノード
        if (node.mathFunction && node.children && node.children.length >= 1) {
                return generateGLSLMathFunction(node, context)
        }

        return '0.0'
}

// GLSL値をフォーマット
const formatGLSLValue = (value: any, type: NodeType): string => {
        if (type === 'float') {
                const num = Number(value)
                return num % 1 === 0 ? `${num}.0` : `${num}`
        }

        if (type === 'int') {
                return `${Math.floor(Number(value))}`
        }

        if (type === 'bool') {
                return Boolean(value) ? 'true' : 'false'
        }

        if (Array.isArray(value)) {
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
                if (fun === 'atan2') return `atan(${x}, ${y})`
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
                if (fun === 'refract') return `refract(${x}, ${y}, ${z})`
        }

        return x || '0.0'
}

// 値からGLSL型を推定
const inferGLSLType = (value: any): string => {
        if (typeof value === 'number') return 'float'
        if (typeof value === 'boolean') return 'bool'
        if (Array.isArray(value)) {
                const len = value.length
                if (len === 2) return 'vec2'
                if (len === 3) return 'vec3'
                if (len === 4) return 'vec4'
        }
        return 'float'
}

// 完全なGLSLシェーダーを生成
export const glsl = (
        fragmentNode: NodeProxy,
        options?: {
                precision?: 'lowp' | 'mediump' | 'highp'
                version?: '100' | '300 es'
                uniforms?: Record<string, any>
        }
) => {
        const precision = options?.precision || 'mediump'
        const version = options?.version || '300 es'

        let shader = ''

        if (version === '300 es') {
                shader += '#version 300 es\n'
        }

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
        if (version === '300 es') {
                shader += 'out vec4 fragColor;\n\n'
        }

        shader += 'void main() {\n'

        const fragmentExpr = nodeToGLSL(fragmentNode)

        if (version === '300 es') {
                shader += `    fragColor = ${fragmentExpr};\n`
        } else {
                shader += `    gl_FragColor = ${fragmentExpr};\n`
        }

        shader += '}\n'

        return shader
}
