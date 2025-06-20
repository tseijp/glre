import { is } from '../utils/helpers'
import { shader } from './code'
import { NodeState, X, ScopeNode, VariableNode } from './types'

export const joins = (children: X[], state: NodeState) => {
        return children
                .filter((x) => !is.und(x) && !is.nul(x))
                .map((x) => shader(x, state))
                .join(', ')
}

// Variable name generation system
const variableCounters = new Map<string, number>()

export const generateVariableName = (prefix: string): string => {
        const count = variableCounters.get(prefix) || 0
        variableCounters.set(prefix, count + 1)
        return `${prefix}${count}`
}

// Type inference system
export const inferType = (node: X): string => {
        if (!node || typeof node === 'number' || typeof node === 'string') {
                return typeof node === 'number' ? 'float' : 'string'
        }

        if (node.type === 'node_type') {
                return node.id as string
        }

        if (node.type === 'function') {
                return inferFunctionReturnType(node.id as string, node.children || [])
        }

        if (node.type === 'operator') {
                return inferOperatorReturnType(node.id as string, node.children || [])
        }

        return 'float' // default
}

const inferFunctionReturnType = (funcName: string, children: X[]): string => {
        // Basic function return types
        const functionTypes: Record<string, string> = {
                sin: 'float',
                cos: 'float',
                normalize: children[0] ? inferType(children[0]) : 'vec3',
                length: 'float',
                vec2: 'vec2',
                vec3: 'vec3',
                vec4: 'vec4',
        }
        return functionTypes[funcName] || 'float'
}

const inferOperatorReturnType = (op: string, children: X[]): string => {
        if (!children.length) return 'float'

        const firstType = inferType(children[0])

        // Comparison operators always return bool
        if (['equal', 'notEqual', 'lessThan', 'lessThanEqual', 'greaterThan', 'greaterThanEqual'].includes(op)) {
                return 'bool'
        }

        // Arithmetic operators preserve the type of the first operand
        return firstType
}

export const inferGLSLType = (type: string, state: NodeState): string => {
        if (state.isWebGL) {
                return type // WebGL uses types as-is
        } else {
                // WebGPU type mapping
                const typeMap: Record<string, string> = {
                        vec2: 'vec2<f32>',
                        vec3: 'vec3<f32>',
                        vec4: 'vec4<f32>',
                        float: 'f32',
                        int: 'i32',
                        bool: 'bool',
                }
                return typeMap[type] || type
        }
}

export const generateFragmentMain = (body: string, state: NodeState): string => {
        if (state.isWebGL)
                return `
void main() {
        gl_FragColor = ${body};
}`.trim()
        else
                return `
@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
        return ${body};
}`.trim()
}
