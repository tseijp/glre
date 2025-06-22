# GLRE Node System Specification

This document provides a comprehensive specification for the GLRE node system, inspired by Three.js Shading Language (TSL), with detailed analysis of the current implementation and missing features.

## Table of Contents

1. [Overview](#overview)
2. [Current Implementation Analysis](#current-implementation-analysis)
3. [Three.js TSL Feature Set](#threejs-tsl-feature-set)
4. [Missing Features Gap Analysis](#missing-features-gap-analysis)
5. [Core Architecture](#core-architecture)
6. [Type System](#type-system)
7. [Node System API](#node-system-api)
8. [Control Flow](#control-flow)
9. [Scope Management](#scope-management)
10. [Mathematical Functions](#mathematical-functions)
11. [Shader Generation](#shader-generation)
12. [Performance and Optimization](#performance-and-optimization)
13. [Implementation Priority](#implementation-priority)

## Overview

The GLRE node system is a TypeScript-based shader abstraction layer that enables developers to write shaders using JavaScript/TypeScript syntax while automatically generating WebGL (GLSL) and WebGPU (WGSL) compatible shader code.

### Design Goals

- **TypeScript-first**: Leverage TypeScript's type system for shader development
- **Cross-platform**: Generate both GLSL and WGSL from the same source
- **Developer Experience**: Provide intuitive API with method chaining and swizzling
- **Performance**: Minimize runtime overhead and optimize generated shaders
- **TSL Compatibility**: Maintain compatibility with Three.js Shading Language concepts

## Current Implementation Analysis

Based on the analysis of the existing codebase, the current implementation includes:

### ✅ Implemented Features

1. **Basic Type System**

      - Scalar types: `float`, `int`, `uint`, `bool`
      - Vector types: `vec2`, `vec3`, `vec4`, `ivec2-4`, `uvec2-4`, `bvec2-4`
      - Matrix types: `mat2`, `mat3`, `mat4`

2. **Basic Operations**

      - Arithmetic operators: `add`, `sub`, `mul`, `div`, `mod`
      - Comparison operators: `equal`, `notEqual`, `lessThan`, `greaterThan`, etc.
      - Logical operators: `and`, `or`, `not`
      - Bitwise operators: `bitAnd`, `bitOr`, `bitXor`, `shiftLeft`, `shiftRight`

3. **Vector Operations**

      - Swizzling: `.x`, `.xy`, `.xyz`, `.rgba`, etc.
      - Assignment to swizzles: `vector.y = value`

4. **Mathematical Functions**

      - Basic math: `abs`, `sin`, `cos`, `sqrt`, `pow`, etc.
      - Vector functions: `normalize`, `cross`, `dot`, `length`, `distance`
      - Interpolation: `mix`, `smoothstep`, `clamp`

5. **Variable Management**

      - Variable declaration: `.toVar(name)`
      - Assignment: `.assign(value)`
      - Uniform variables: `uniform(value)`

6. **Control Flow (Basic)**

      - Conditional statements: `If()`, `Else()`, `ElseIf()`
      - Loop statements: `Loop(count, callback)`
      - Function definitions: `Fn(callback)`

7. **Code Generation**
      - Basic GLSL/WGSL output
      - Type inference and mapping
      - Scope management

### ❌ Missing or Limited Features

1. **Advanced Function System**

      - No proper function parameter typing
      - No function layout specifications
      - No function caching/optimization
      - No recursive function support

2. **Enhanced Control Flow**

      - No `Switch`/`Case` statements
      - No `Break`/`Continue` in loops
      - No ternary operator (`select`)
      - Limited loop variants (start/end ranges, conditions)

3. **Advanced Variable Management**

      - No `varying` declarations
      - No `vertexStage()` function
      - No proper constant (`toConst`) handling
      - No property declarations

4. **Node System Features**

      - No method chaining for mathematical functions
      - No automatic optimization
      - No node caching
      - No proper error handling

5. **TSL-Specific Features**

      - No texture operations
      - No attribute handling
      - No built-in shader variables (position, normal, etc.)
      - No material integration
      - No lighting models

6. **Shader Generation**
      - Limited uniform handling
      - No proper shader structure generation
      - No include system
      - No optimization passes

## Three.js TSL Feature Set

Based on the TSL documentation analysis, here are the key features from Three.js TSL:

### Core TSL Features

1. **ShaderNode System**

      - Node-based proxy objects with method chaining
      - Automatic type conversion and inference
      - Swizzling with multiple coordinate systems (xyzw, rgba, stpq)

2. **Function System**

      - `Fn()` with layout specifications
      - Function caching and optimization
      - Parameter handling with destructuring
      - Deferred functions with material/geometry access

3. **Type System**

      - All GLSL/WGSL types with automatic conversion
      - Method chaining for type conversions (`.toFloat()`, `.toVec3()`, etc.)
      - Automatic type inference and promotion

4. **Control Flow**

      - `If`/`ElseIf`/`Else` with proper scoping
      - `Switch`/`Case`/`Default` statements
      - `Loop` with various configurations
      - Ternary operations with `select()`

5. **Variable Management**

      - `uniform()` with update events (`onFrameUpdate`, `onRenderUpdate`, etc.)
      - `varying()` and `vertexStage()` for vertex/fragment communication
      - `.toVar()` and `.toConst()` for variable declaration
      - Property declarations

6. **Mathematical Functions**

      - Comprehensive GLSL function library
      - Method chaining support (e.g., `value.abs().sin()`)
      - Vector and matrix operations

7. **Shader Integration**
      - Built-in variables: `positionLocal`, `normalView`, `uv()`, etc.
      - Texture operations: `texture()`, `cubeTexture()`, etc.
      - Attribute access: `attribute()`, `vertexColor()`
      - Material properties integration

## Missing Features Gap Analysis

### High Priority Missing Features

1. **Advanced Function System**

      ```typescript
      // Current (limited)
      const func = Fn((args) => {
              /* ... */
      })

      // TSL-like (missing)
      const func = Fn(({ position, normal }) => {
              /* ... */
      })
      const func = Fn().setLayout({
              inputs: [{ name: 'position', type: 'vec3' }],
              return: 'vec4',
      })
      ```

2. **Method Chaining for Math Functions**

      ```typescript
      // Current
      const result = normalize(abs(value))

      // TSL-like (missing)
      const result = value.abs().normalize()
      ```

3. **Advanced Control Flow**

      ```typescript
      // Missing Switch/Case
      Switch(value)
              .Case(0, () => {
                      /* ... */
              })
              .Case(1, 2, () => {
                      /* ... */
              })
              .Default(() => {
                      /* ... */
              })

      // Missing ternary
      const result = select(condition, valueTrue, valueFalse)
      ```

4. **Varying and Vertex Stage**

      ```typescript
      // Missing varying support
      const vPos = varying(positionLocal)
      const vNormal = vertexStage(normalLocal)
      ```

5. **Texture Operations**
      ```typescript
      // Missing texture functions
      const texColor = texture(diffuseMap, uv())
      const cubeColor = cubeTexture(envMap, reflectVector)
      ```

### Medium Priority Missing Features

1. **Built-in Shader Variables**

      ```typescript
      // Missing built-in variables
      const pos = positionLocal
      const norm = normalView
      const uvCoord = uv()
      const screenPos = screenUV
      ```

2. **Uniform Update Events**

      ```typescript
      // Missing uniform events
      const time = uniform(0).onFrameUpdate(({ frame }) => frame.time)
      const objPos = uniform(vec3()).onObjectUpdate(({ object }) => object.position)
      ```

3. **Advanced Type Conversions**

      ```typescript
      // Missing method chaining conversions
      const result = value.toVec3().toColor()
      ```

4. **Loop Variants**
      ```typescript
      // Missing advanced loop configurations
      Loop({ start: int(0), end: int(10), type: 'int' }, ({ i }) => {})
      Loop(condition, () => {}) // while-like
      ```

### Low Priority Missing Features

1. **Attribute Handling**

      ```typescript
      const pos = attribute('position', 'vec3')
      const color = vertexColor(0)
      ```

2. **Blend Modes and UV Utils**

      ```typescript
      const blended = blendScreen(colorA, colorB)
      const rotated = rotateUV(uv(), angle)
      ```

3. **Material Integration**
      ```typescript
      // Material node connections
      material.colorNode = myColorFunction()
      material.normalNode = myNormalFunction()
      ```

## Core Architecture

### Node Structure

```typescript
interface Node {
        type: NodeType
        props: NodeProps
        children?: Node[]
}

interface NodeProps {
        id?: string
        children?: Node[]
        defaultValue?: any
        layout?: FunctionLayout
}

type NodeType =
        | 'uniform'
        | 'variable'
        | 'swizzle'
        | 'operator'
        | 'node_type'
        | 'math_fun'
        | 'declare'
        | 'assign'
        | 'fn'
        | 'if'
        | 'loop'
        | 'scope'
        | 'switch'
        | 'varying'
        | 'attribute'
        | 'texture'
```

### Proxy-based Node Implementation

```typescript
const node = (type: NodeType, props?: NodeProps, ...args: any[]) => {
        return new Proxy(() => {}, {
                get(_, key) {
                        // Handle core properties
                        if (key === 'type') return type
                        if (key === 'props') return props

                        // Handle operations
                        if (isSwizzle(key)) return createSwizzle(key)
                        if (isOperator(key)) return createOperator(key)
                        if (isFunction(key)) return createFunction(key)
                        if (isConversion(key)) return createConversion(key)

                        // Handle variable operations
                        if (key === 'toVar') return toVar
                        if (key === 'assign') return assign
                        if (key === 'toConst') return toConst
                },
                set(_, key, value) {
                        // Handle swizzle assignment
                        if (isSwizzle(key)) {
                                createSwizzle(key).assign(value)
                                return true
                        }
                        return false
                },
        })
}
```

## Type System

### Scalar Types

```typescript
export const float = (x?: number) => node('node_type', null, 'float', x ?? 0)
export const int = (x?: number) => node('node_type', null, 'int', x ?? 0)
export const uint = (x?: number) => node('node_type', null, 'uint', x ?? 0)
export const bool = (x?: boolean) => node('node_type', null, 'bool', x ?? false)
```

### Vector Types

```typescript
export const vec2 = (x?: any, y?: any) => node('node_type', null, 'vec2', x, y)
export const vec3 = (x?: any, y?: any, z?: any) => node('node_type', null, 'vec3', x, y, z)
export const vec4 = (x?: any, y?: any, z?: any, w?: any) => node('node_type', null, 'vec4', x, y, z, w)

// Integer vectors
export const ivec2 = (x?: any, y?: any) => node('node_type', null, 'ivec2', x, y)
export const ivec3 = (x?: any, y?: any, z?: any) => node('node_type', null, 'ivec3', x, y, z)
export const ivec4 = (x?: any, y?: any, z?: any, w?: any) => node('node_type', null, 'ivec4', x, y, z, w)

// Unsigned vectors
export const uvec2 = (x?: any, y?: any) => node('node_type', null, 'uvec2', x, y)
export const uvec3 = (x?: any, y?: any, z?: any) => node('node_type', null, 'uvec3', x, y, z)
export const uvec4 = (x?: any, y?: any, z?: any, w?: any) => node('node_type', null, 'uvec4', x, y, z, w)

// Boolean vectors
export const bvec2 = (x?: any, y?: any) => node('node_type', null, 'bvec2', x, y)
export const bvec3 = (x?: any, y?: any, z?: any) => node('node_type', null, 'bvec3', x, y, z)
export const bvec4 = (x?: any, y?: any, z?: any, w?: any) => node('node_type', null, 'bvec4', x, y, z, w)
```

### Matrix Types

```typescript
export const mat2 = (...args: any[]) => node('node_type', null, 'mat2', ...args)
export const mat3 = (...args: any[]) => node('node_type', null, 'mat3', ...args)
export const mat4 = (...args: any[]) => node('node_type', null, 'mat4', ...args)
```

### Color Type

```typescript
export const color = (r?: any, g?: any, b?: any) => {
        if (typeof r === 'number' && g === undefined && b === undefined) {
                // Hex color
                const hex = r
                const rVal = ((hex >> 16) & 0xff) / 255
                const gVal = ((hex >> 8) & 0xff) / 255
                const bVal = (hex & 0xff) / 255
                return vec3(rVal, gVal, bVal)
        }
        return vec3(r, g, b)
}
```

## Node System API

### Method Chaining Support

```typescript
// Mathematical functions as methods
interface NodeProxy {
        // Existing operators
        add(x: any): NodeProxy
        sub(x: any): NodeProxy
        mul(x: any): NodeProxy
        div(x: any): NodeProxy

        // Mathematical functions as methods
        abs(): NodeProxy
        sin(): NodeProxy
        cos(): NodeProxy
        sqrt(): NodeProxy
        normalize(): NodeProxy
        length(): NodeProxy

        // Type conversions as methods
        toFloat(): NodeProxy
        toInt(): NodeProxy
        toVec2(): NodeProxy
        toVec3(): NodeProxy
        toVec4(): NodeProxy
        toColor(): NodeProxy

        // Utility methods
        oneMinus(): NodeProxy
        saturate(): NodeProxy
        fract(): NodeProxy
}
```

### Implementation of Method Chaining

```typescript
const addMethodChaining = (name: string, nodeElement: Function) => {
        if (methodChainElements.has(name)) {
                console.warn(`Method chaining '${name}' already exists`)
                return
        }
        methodChainElements.set(name, nodeElement)
}

// Register mathematical functions for method chaining
addMethodChaining('abs', (node) => abs(node))
addMethodChaining('sin', (node) => sin(node))
addMethodChaining('cos', (node) => cos(node))
addMethodChaining('normalize', (node) => normalize(node))
addMethodChaining('length', (node) => length(node))

// Register type conversions
addMethodChaining('toFloat', (node) => float(node))
addMethodChaining('toVec3', (node) => vec3(node))
addMethodChaining('toColor', (node) => color(node))
```

## Control Flow

### Enhanced If Statements

```typescript
export const If = (condition: any, callback: () => void) => {
  const scope = node('scope')
  scoped(scope, callback)
  const ifNode = node('if', null, condition, scope)
  addToScope(ifNode)

  return {
    ElseIf: (newCondition: any, elseIfCallback: () => void) => {
      const elseIfScope = node('scope')
      scoped(elseIfScope, elseIfCallback)
      ifNode.props.children!.push(newCondition, elseIfScope)
      return { ElseIf: /* ... */, Else: /* ... */ }
    },
    Else: (elseCallback: () => void) => {
      const elseScope = node('scope')
      scoped(elseScope, elseCallback)
      ifNode.props.children!.push(elseScope)
    }
  }
}
```

### Switch/Case Statements

```typescript
export const Switch = (value: any) => {
  const switchNode = node('switch', null, value)
  addToScope(switchNode)

  return {
    Case: (...values: any[]) => {
      return (callback: () => void) => {
        const caseScope = node('scope')
        scoped(caseScope, callback)
        switchNode.props.children!.push(node('case', null, values, caseScope))
        return { Case: /* ... */, Default: /* ... */ }
      }
    },
    Default: (callback: () => void) => {
      const defaultScope = node('scope')
      scoped(defaultScope, callback)
      switchNode.props.children!.push(node('default', null, defaultScope))
    }
  }
}
```

### Enhanced Loop System

```typescript
interface LoopConfig {
        start?: any
        end?: any
        type?: 'int' | 'uint' | 'float'
        condition?: '<' | '<=' | '>' | '>='
}

export const Loop = (config: number | LoopConfig | any, callback?: (params: { i: NodeProxy }) => void) => {
        if (typeof config === 'number') {
                // Simple count loop
                return createSimpleLoop(config, callback)
        } else if (typeof config === 'object' && 'start' in config) {
                // Advanced loop with configuration
                return createAdvancedLoop(config, callback)
        } else {
                // Condition-based loop (while-like)
                return createConditionalLoop(config, callback)
        }
}
```

### Ternary Operations

```typescript
export const select = (condition: any, trueValue: any, falseValue: any) => {
        return node('ternary', null, condition, trueValue, falseValue)
}
```

## Scope Management

### Advanced Scope System

```typescript
interface ScopeContext {
        node: NodeProxy
        variables: Map<string, NodeProxy>
        functions: Map<string, NodeProxy>
        parent?: ScopeContext
}

let currentScope: ScopeContext | null = null

const scoped = (scopeNode: NodeProxy, callback: () => void) => {
        const parentScope = currentScope
        currentScope = {
                node: scopeNode,
                variables: new Map(),
                functions: new Map(),
                parent: parentScope,
        }

        try {
                callback()
        } finally {
                currentScope = parentScope
        }
}

const addToScope = (node: NodeProxy) => {
        if (!currentScope) {
                throw new Error('No active scope for node addition')
        }

        if (!currentScope.node.props.children) {
                currentScope.node.props.children = []
        }
        currentScope.node.props.children.push(node)
}
```

### Variable Management in Scope

```typescript
export const toVar = (value: any) => (name?: string) => {
        if (!name) name = generateId()

        const variable = node('variable', { id: name })
        const declaration = node('declare', null, variable, value)

        addToScope(declaration)

        // Register variable in current scope
        if (currentScope) {
                currentScope.variables.set(name, variable)
        }

        return variable
}

export const toConst = (value: any) => (name?: string) => {
        if (!name) name = generateId()

        const constant = node('constant', { id: name })
        const declaration = node('declare', null, constant, value)

        addToScope(declaration)
        return constant
}
```

### Varying and Vertex Stage

```typescript
export const varying = (value: any, name?: string) => {
        if (!name) name = generateId()

        const varyingVar = node('varying', { id: name })
        const declaration = node('declare', null, varyingVar, value)

        addToScope(declaration)
        return varyingVar
}

export const vertexStage = (value: any) => {
        return node('vertex_stage', null, value)
}
```

## Mathematical Functions

### Core Math Functions with Method Chaining

```typescript
// Basic mathematical functions
export const abs = (x: any) => node('math_fun', null, 'abs', x)
export const sin = (x: any) => node('math_fun', null, 'sin', x)
export const cos = (x: any) => node('math_fun', null, 'cos', x)
export const tan = (x: any) => node('math_fun', null, 'tan', x)
export const asin = (x: any) => node('math_fun', null, 'asin', x)
export const acos = (x: any) => node('math_fun', null, 'acos', x)
export const atan = (y: any, x?: any) =>
        x !== undefined ? node('math_fun', null, 'atan2', y, x) : node('math_fun', null, 'atan', y)

// Power and exponential
export const pow = (x: any, y: any) => node('math_fun', null, 'pow', x, y)
export const pow2 = (x: any) => node('math_fun', null, 'pow2', x)
export const pow3 = (x: any) => node('math_fun', null, 'pow3', x)
export const pow4 = (x: any) => node('math_fun', null, 'pow4', x)
export const sqrt = (x: any) => node('math_fun', null, 'sqrt', x)
export const inverseSqrt = (x: any) => node('math_fun', null, 'inverseSqrt', x)
export const exp = (x: any) => node('math_fun', null, 'exp', x)
export const exp2 = (x: any) => node('math_fun', null, 'exp2', x)
export const log = (x: any) => node('math_fun', null, 'log', x)
export const log2 = (x: any) => node('math_fun', null, 'log2', x)

// Rounding and modulo
export const floor = (x: any) => node('math_fun', null, 'floor', x)
export const ceil = (x: any) => node('math_fun', null, 'ceil', x)
export const round = (x: any) => node('math_fun', null, 'round', x)
export const fract = (x: any) => node('math_fun', null, 'fract', x)
export const mod = (x: any, y: any) => node('math_fun', null, 'mod', x, y)
export const trunc = (x: any) => node('math_fun', null, 'trunc', x)

// Min/max and clamping
export const min = (x: any, y: any) => node('math_fun', null, 'min', x, y)
export const max = (x: any, y: any) => node('math_fun', null, 'max', x, y)
export const clamp = (x: any, min: any, max: any) => node('math_fun', null, 'clamp', x, min, max)
export const saturate = (x: any) => node('math_fun', null, 'saturate', x)

// Interpolation
export const mix = (x: any, y: any, a: any) => node('math_fun', null, 'mix', x, y, a)
export const step = (edge: any, x: any) => node('math_fun', null, 'step', edge, x)
export const smoothstep = (edge0: any, edge1: any, x: any) => node('math_fun', null, 'smoothstep', edge0, edge1, x)

// Vector functions
export const length = (x: any) => node('math_fun', null, 'length', x)
export const distance = (x: any, y: any) => node('math_fun', null, 'distance', x, y)
export const dot = (x: any, y: any) => node('math_fun', null, 'dot', x, y)
export const cross = (x: any, y: any) => node('math_fun', null, 'cross', x, y)
export const normalize = (x: any) => node('math_fun', null, 'normalize', x)
export const reflect = (I: any, N: any) => node('math_fun', null, 'reflect', I, N)
export const refract = (I: any, N: any, eta: any) => node('math_fun', null, 'refract', I, N, eta)

// Utility functions
export const sign = (x: any) => node('math_fun', null, 'sign', x)
export const oneMinus = (x: any) => node('math_fun', null, 'oneMinus', x)
export const reciprocal = (x: any) => node('math_fun', null, 'reciprocal', x)
export const negate = (x: any) => node('math_fun', null, 'negate', x)

// Derivatives
export const dFdx = (x: any) => node('math_fun', null, 'dFdx', x)
export const dFdy = (x: any) => node('math_fun', null, 'dFdy', x)
export const fwidth = (x: any) => node('math_fun', null, 'fwidth', x)
```

## Shader Generation

### Enhanced Code Generation

```typescript
export const generateShader = (rootNode: any, config: ShaderConfig): { vertex: string; fragment: string } => {
        const builder = new ShaderBuilder(config)

        // Build the shader tree
        const result = builder.build(rootNode)

        return {
                vertex: builder.generateVertex(result),
                fragment: builder.generateFragment(result),
        }
}

interface ShaderConfig {
        target: 'webgl' | 'webgpu'
        optimize: boolean
        uniforms: Map<string, UniformInfo>
        attributes: Map<string, AttributeInfo>
        varyings: Map<string, VaryingInfo>
}

class ShaderBuilder {
        private uniforms = new Map<string, UniformInfo>()
        private attributes = new Map<string, AttributeInfo>()
        private varyings = new Map<string, VaryingInfo>()
        private functions = new Map<string, FunctionInfo>()

        constructor(private config: ShaderConfig) {}

        build(node: any): BuildResult {
                // Three-phase build process
                this.setupPhase(node)
                this.analyzePhase(node)
                return this.generatePhase(node)
        }

        private setupPhase(node: any) {
                // Collect uniforms, attributes, varyings, functions
        }

        private analyzePhase(node: any) {
                // Optimize the node tree, resolve dependencies
        }

        private generatePhase(node: any): BuildResult {
                // Generate the final shader code
        }
}
```

### Texture and Sampling Operations

```typescript
// Texture operations
export const texture = (tex: any, uv: any, level?: any) => {
        return node('texture', null, 'texture', tex, uv, level)
}

export const cubeTexture = (tex: any, direction: any, level?: any) => {
        return node('texture', null, 'cubeTexture', tex, direction, level)
}

export const textureSize = (tex: any, level?: any) => {
        return node('texture', null, 'textureSize', tex, level)
}

export const textureLoad = (tex: any, coord: any, level?: any) => {
        return node('texture', null, 'textureLoad', tex, coord, level)
}

export const textureSample = (tex: any, sampler: any, coord: any) => {
        return node('texture', null, 'textureSample', tex, sampler, coord)
}
```

### Built-in Variables and Attributes

```typescript
// Position variables
export const positionGeometry = node('builtin', { id: 'positionGeometry' })
export const positionLocal = node('builtin', { id: 'positionLocal' })
export const positionWorld = node('builtin', { id: 'positionWorld' })
export const positionView = node('builtin', { id: 'positionView' })

// Normal variables
export const normalGeometry = node('builtin', { id: 'normalGeometry' })
export const normalLocal = node('builtin', { id: 'normalLocal' })
export const normalWorld = node('builtin', { id: 'normalWorld' })
export const normalView = node('builtin', { id: 'normalView' })

// Screen and viewport
export const screenUV = node('builtin', { id: 'screenUV' })
export const screenCoordinate = node('builtin', { id: 'screenCoordinate' })
export const viewportUV = node('builtin', { id: 'viewportUV' })

// Attributes
export const uv = (index = 0) => node('attribute', { id: `uv${index || ''}` })
export const vertexColor = (index = 0) => node('attribute', { id: `color${index || ''}` })
export const attribute = (name: string, type?: string) => node('attribute', { id: name, type })

// Time and animation
export const time = node('builtin', { id: 'time' })
export const deltaTime = node('builtin', { id: 'deltaTime' })
export const frame = node('builtin', { id: 'frame' })
```

## Performance and Optimization

### Node Caching and Reuse

```typescript
const nodeCache = new WeakMap<object, NodeProxy>()

const createCachedNode = (type: string, ...args: any[]) => {
        const cacheKey = { type, args }

        if (nodeCache.has(cacheKey)) {
                return nodeCache.get(cacheKey)!
        }

        const newNode = node(type, null, ...args)
        nodeCache.set(cacheKey, newNode)
        return newNode
}
```

### Automatic Optimization

```typescript
interface OptimizationPass {
        name: string
        apply(node: NodeProxy): NodeProxy
}

const optimizationPasses: OptimizationPass[] = [
        {
                name: 'constant-folding',
                apply: (node) => {
                        // Fold constant expressions
                        return foldConstants(node)
                },
        },
        {
                name: 'dead-code-elimination',
                apply: (node) => {
                        // Remove unused variables and expressions
                        return eliminateDeadCode(node)
                },
        },
        {
                name: 'common-subexpression-elimination',
                apply: (node) => {
                        // Eliminate redundant calculations
                        return eliminateCommonSubexpressions(node)
                },
        },
]
```

## Implementation Priority

### Phase 1: Core Enhancements (High Priority)

1. **Method Chaining for Mathematical Functions**

      - Implement method chaining system
      - Add all mathematical functions as methods
      - Add type conversion methods

2. **Advanced Control Flow**

      - Implement `Switch`/`Case` statements
      - Add ternary operations (`select`)
      - Enhance loop system with configurations

3. **Enhanced Function System**
      - Function layouts and parameter typing
      - Function caching and optimization
      - Proper function scoping

### Phase 2: Shader Integration (Medium Priority)

1. **Built-in Variables and Attributes**

      - Position, normal, UV variables
      - Screen and viewport coordinates
      - Time and animation variables

2. **Texture Operations**

      - Basic texture sampling
      - Cube texture support
      - Texture utility functions

3. **Varying and Vertex Stage**
      - Vertex/fragment communication
      - Proper varying declarations
      - Vertex stage optimization

### Phase 3: Advanced Features (Low Priority)

1. **Uniform Enhancement**

      - Update events (onFrameUpdate, etc.)
      - Automatic uniform collection
      - Uniform optimization

2. **Material Integration**

      - Material node connections
      - Lighting model support
      - PBR material nodes

3. **Advanced Optimizations**
      - Node caching system
      - Automatic optimization passes
      - Performance profiling

### Phase 4: Ecosystem Integration

1. **Three.js Integration**

      - NodeMaterial compatibility
      - Three.js renderer support
      - Material editor tools

2. **Development Tools**
      - Shader debugging
      - Visual node editor
      - Performance analytics

## Conclusion

This specification provides a comprehensive roadmap for enhancing the GLRE node system to achieve compatibility with Three.js TSL while maintaining its unique TypeScript-first approach. The implementation should prioritize core functionality first, followed by shader integration features, and finally advanced optimization and ecosystem integration.

The goal is to create a powerful, type-safe, and developer-friendly shader authoring system that can compete with and complement existing solutions in the WebGL/WebGPU ecosystem.
