# Node System Overview

## TypeScript Shading Language

GLRE の Node System は、TypeScript の構文でシェーダーコードを記述できる独自の DSL（Domain Specific Language）です。
Three.js TSL の仕様と完全互換性を持ちながら、GLSL/WGSL の両方に対応したコード生成を提供します。

## Core Architecture

### Node Construction

| Component                | Purpose                    | Example                            |
| ------------------------ | -------------------------- | ---------------------------------- |
| **NodeProxy**            | メソッドチェーンによる操作 | `vec3(1, 0, 0).mul(2).add(offset)` |
| **Type System**          | 型推論と自動変換           | `float + vec3 → vec3`              |
| **Abstract Syntax Tree** | 構文木による表現           | `add(mul(vec3, 2), offset)`        |

### Factory Functions

#### Basic Types

| Function           | Parameters                   | Return Type | Description           |
| ------------------ | ---------------------------- | ----------- | --------------------- |
| `float(value)`     | `number\|Node`               | `float`     | 32-bit floating point |
| `int(value)`       | `number\|Node`               | `int`       | 32-bit integer        |
| `bool(value)`      | `boolean\|Node`              | `bool`      | Boolean value         |
| `vec2(x, y)`       | `number\|Node, number\|Node` | `vec2`      | 2D vector             |
| `vec3(x, y, z)`    | `number\|Node, ...`          | `vec3`      | 3D vector             |
| `vec4(x, y, z, w)` | `number\|Node, ...`          | `vec4`      | 4D vector             |

#### Matrix Types

| Function    | Parameters       | Return Type | Description |
| ----------- | ---------------- | ----------- | ----------- |
| `mat2(...)` | `number[]\|Node` | `mat2`      | 2x2 matrix  |
| `mat3(...)` | `number[]\|Node` | `mat3`      | 3x3 matrix  |
| `mat4(...)` | `number[]\|Node` | `mat4`      | 4x4 matrix  |

### Variable Declaration

| Function               | Purpose                | Usage                  | Description               |
| ---------------------- | ---------------------- | ---------------------- | ------------------------- |
| `uniform(value, id?)`  | CPU-GPU data transfer  | `uniform(1.0)`         | Reactive uniform variable |
| `attribute(data, id?)` | Vertex attributes      | `attribute([0, 1, 0])` | Vertex data input         |
| `builtin(name)`        | Built-in variables     | `builtin('position')`  | System variables          |
| `constant(value, id?)` | Compile-time constants | `constant(3.14159)`    | Immutable values          |

## Type System

### Automatic Type Conversion

```javascript
// 自動型変換の例
const scalar = float(2.0)
const vector = vec3(1, 0, 0)

// float は vec3 に自動拡張
const result = scalar.add(vector) // vec3(3, 2, 2)
```

### Type Conversion Methods

| Method       | Source → Target | Example                                 |
| ------------ | --------------- | --------------------------------------- |
| `.toFloat()` | `any → float`   | `vec3(1,2,3).toFloat() // 1.0`          |
| `.toVec2()`  | `any → vec2`    | `vec4(1,2,3,4).toVec2() // vec2(1,2)`   |
| `.toVec3()`  | `any → vec3`    | `float(1).toVec3() // vec3(1,1,1)`      |
| `.toVec4()`  | `any → vec4`    | `vec3(1,2,3).toVec4() // vec4(1,2,3,1)` |
| `.toColor()` | `any → vec3`    | Color space conversion                  |

### Swizzling Operations

| Pattern | Usage                | Result Type | Example                 |
| ------- | -------------------- | ----------- | ----------------------- |
| `xyzw`  | Position coordinates | Varies      | `pos.xyz`, `pos.xy`     |
| `rgba`  | Color components     | Varies      | `color.rgb`, `color.rg` |
| `stpq`  | Texture coordinates  | Varies      | `uv.st`, `uv.s`         |

```javascript
const pos = vec4(1, 2, 3, 4)
const xyz = pos.xyz // vec3(1, 2, 3)
const yx = pos.yx // vec2(2, 1)
const w = pos.w // float(4)
```

## Operators and Functions

### Arithmetic Operations

| Method    | Symbol | Vector Support | Example    |
| --------- | ------ | -------------- | ---------- |
| `.add(x)` | `+`    | ✓              | `a.add(b)` |
| `.sub(x)` | `-`    | ✓              | `a.sub(b)` |
| `.mul(x)` | `*`    | ✓              | `a.mul(b)` |
| `.div(x)` | `/`    | ✓              | `a.div(b)` |
| `.mod(x)` | `%`    | ✓              | `a.mod(b)` |

### Comparison Operations

| Method                 | Symbol | Return Type | Example                 |
| ---------------------- | ------ | ----------- | ----------------------- |
| `.equal(x)`            | `==`   | `bool`      | `a.equal(b)`            |
| `.notEqual(x)`         | `!=`   | `bool`      | `a.notEqual(b)`         |
| `.lessThan(x)`         | `<`    | `bool`      | `a.lessThan(b)`         |
| `.greaterThan(x)`      | `>`    | `bool`      | `a.greaterThan(b)`      |
| `.lessThanEqual(x)`    | `<=`   | `bool`      | `a.lessThanEqual(b)`    |
| `.greaterThanEqual(x)` | `>=`   | `bool`      | `a.greaterThanEqual(b)` |

### Mathematical Functions

| Function                     | Description          | Vector Support | Example               |
| ---------------------------- | -------------------- | -------------- | --------------------- |
| `sin(x)`, `cos(x)`, `tan(x)` | Trigonometric        | ✓              | `sin(angle)`          |
| `pow(x, y)`                  | Power                | ✓              | `pow(base, exp)`      |
| `sqrt(x)`                    | Square root          | ✓              | `sqrt(value)`         |
| `abs(x)`                     | Absolute value       | ✓              | `abs(signed)`         |
| `floor(x)`, `ceil(x)`        | Rounding             | ✓              | `floor(value)`        |
| `min(x, y)`, `max(x, y)`     | Min/Max              | ✓              | `min(a, b)`           |
| `mix(x, y, a)`               | Linear interpolation | ✓              | `mix(a, b, t)`        |
| `step(edge, x)`              | Step function        | ✓              | `step(0.5, x)`        |
| `smoothstep(a, b, x)`        | Smooth step          | ✓              | `smoothstep(0, 1, x)` |

## Control Structures

### Conditional Branching

```javascript
// If-ElseIf-Else構文
If(condition, () => {
        return vec3(1, 0, 0)
})
        .ElseIf(condition2, () => {
                return vec3(0, 1, 0)
        })
        .Else(() => {
                return vec3(0, 0, 1)
        })

// Ternary operator
const result = select(condition, trueValue, falseValue)
```

### Loop Structures

```javascript
// Count-based loop
Loop(10, ({ i }) => {
        accumulator.assign(accumulator.add(sample(i)))
})

// Condition-based loop
Loop(value.lessThan(threshold), () => {
        value.assign(value.mul(2))
})

// Nested loops
Loop(10, 5, ({ i, j }) => {
        grid.element(i, j).assign(calculate(i, j))
})
```

### Switch Statements

```javascript
Switch(mode)
        .Case(0, () => {
                return normalMode()
        })
        .Case(1, 2, () => {
                return enhancedMode()
        })
        .Default(() => {
                return fallbackMode()
        })
```

## Function Definition

### Custom Functions

```javascript
// Basic function definition
const myFunction = Fn(([input]) => {
        return input.mul(2).add(1)
})

// Function with layout specification
const complexFunction = Fn(({ input, scale }) => {
        return input.mul(scale).normalize()
}).setLayout({
        name: 'complexFunction',
        type: 'vec3',
        inputs: [
                { name: 'input', type: 'vec3' },
                { name: 'scale', type: 'float' },
        ],
})
```

### Built-in Variables

| Variable        | Type   | Stage           | Description            |
| --------------- | ------ | --------------- | ---------------------- |
| `position`      | `vec4` | Vertex/Fragment | Current position       |
| `normal`        | `vec3` | Fragment        | Surface normal         |
| `uv`            | `vec2` | Fragment        | Texture coordinates    |
| `vertexIndex`   | `int`  | Vertex          | Current vertex index   |
| `instanceIndex` | `int`  | Vertex          | Current instance index |

### Standard Uniforms

| Uniform       | Type    | Description               |
| ------------- | ------- | ------------------------- |
| `iTime`       | `float` | Elapsed time in seconds   |
| `iResolution` | `vec2`  | Canvas resolution         |
| `iMouse`      | `vec2`  | Normalized mouse position |

## Code Generation Flow

```
TypeScript DSL
      │
  ┌───▼───┐
  │ Node  │ ──── Abstract Syntax Tree
  │ Tree  │      Type Inference
  └───┬───┘      Optimization
      │
  ┌───▼───┐
  │ Code  │ ──── GLSL Generation
  │ Gen   │      WGSL Generation
  └───┬───┘      Binding Assignment
      │
  ┌───▼───┐
  │Shader │ ──── Compilation
  │Program│      GPU Upload
  └───────┘
```

## Advanced Features

### Vertex Stage Processing

```javascript
// Vertex computation with fragment usage
const worldPos = vertexStage(attribute('position').mul(uniform('modelMatrix')))

// Use in fragment shader
const fragmentColor = worldPos.normalize()
```

### Struct Definitions

```javascript
// Define custom struct
const Material = struct({
        albedo: 'vec3',
        roughness: 'float',
        metallic: 'float',
})

// Create instance
const material = Material({
        albedo: vec3(1, 0, 0),
        roughness: 0.5,
        metallic: 0.0,
})

// Member access
const color = material.albedo
```

### Texture Sampling

```javascript
// Basic texture sampling
const color = texture(uniform('mainTexture'), uv)

// Mipmap level sampling
const detail = texture(uniform('detailTexture'), uv, level)

// Cube texture sampling
const envColor = cubeTexture(uniform('envMap'), reflectVector)
```

GLRE の Node System は、従来のシェーダープログラミングの複雑さを抽象化し、TypeScript の表現力を活用した直感的な記述を可能にします。
