# Node System Overview

TypeScript Shading Language (TSL) for GPU programming.

## Core Concepts

### What is the Node System?

The Node System is a TypeScript-based Domain Specific Language (DSL) that compiles to GPU shader code.
It provides familiar programming constructs while generating efficient GLSL/WGSL output.

```javascript
// TypeScript Node System
const fragment = () => {
        const position = builtin('position')
        const wave = sin(position.x.add(iTime))
        const color = wave.mul(0.5).add(0.5)

        return vec4(color, color, color, 1.0)
}

// Compiles to shader code automatically
```

### Why Use Nodes?

- **Type Safety**: TypeScript provides compile-time error checking
- **Familiar Syntax**: Uses JavaScript/TypeScript patterns
- **Automatic Optimization**: Generates efficient GPU code
- **Cross-Platform**: Compiles to both GLSL and WGSL

## Basic Building Blocks

### Factory Functions

Create typed values with factory functions:

| Function           | Type    | Example            | Description   |
| ------------------ | ------- | ------------------ | ------------- |
| `float(value)`     | `float` | `float(3.14)`      | Single number |
| `vec2(x, y)`       | `vec2`  | `vec2(1, 0)`       | 2D vector     |
| `vec3(x, y, z)`    | `vec3`  | `vec3(1, 0, 0)`    | 3D vector     |
| `vec4(x, y, z, w)` | `vec4`  | `vec4(1, 0, 0, 1)` | 4D vector     |

### Variable Sources

Access different types of data:

| Function          | Purpose         | Example                 |
| ----------------- | --------------- | ----------------------- |
| `uniform(name)`   | CPU-to-GPU data | `uniform('time')`       |
| `attribute(name)` | Vertex data     | `attribute('position')` |
| `builtin(name)`   | GPU built-ins   | `builtin('position')`   |

## Mathematical Operations

### Basic Math

All standard math operations work with method chaining:

```javascript
const a = float(2.0)
const b = float(3.0)

const sum = a.add(b) // 2.0 + 3.0 = 5.0
const product = a.mul(b) // 2.0 * 3.0 = 6.0
const power = a.pow(b) // 2.0 ^ 3.0 = 8.0
```

### Vector Operations

Vectors support component-wise operations:

```javascript
const v1 = vec3(1, 2, 3)
const v2 = vec3(4, 5, 6)

const sum = v1.add(v2) // vec3(5, 7, 9)
const dot = v1.dot(v2) // 1*4 + 2*5 + 3*6 = 32
const cross = v1.cross(v2) // Cross product
```

### Function Library

Built-in mathematical functions:

```javascript
// Trigonometry
const angle = float(3.14159 / 4)
const sine = sin(angle)
const cosine = cos(angle)

// Exponentials
const base = float(2.0)
const exponent = float(3.0)
const power = pow(base, exponent)
const squareRoot = sqrt(base)

// Common functions
const value = float(-2.5)
const absolute = abs(value) // 2.5
const rounded = floor(value) // -3.0
const fractional = fract(value) // 0.5
```

## Type System

### Automatic Type Conversion

The system automatically promotes types when needed:

```javascript
const scalar = float(2.0)
const vector = vec3(1, 0, 0)

// scalar is automatically promoted to vec3(2, 2, 2)
const result = scalar.add(vector) // vec3(3, 2, 2)
```

### Swizzling

Access vector components using swizzling:

```javascript
const color = vec4(1.0, 0.5, 0.2, 1.0)

// Single components
const red = color.r // or color.x
const alpha = color.a // or color.w

// Multiple components
const rgb = color.rgb // vec3(1.0, 0.5, 0.2)
const xy = color.xy // vec2(1.0, 0.5)

// Reordering
const bgr = color.bgr // vec3(0.2, 0.5, 1.0)
```

### Type Patterns

| Pattern | Description         | Components              |
| ------- | ------------------- | ----------------------- |
| `xyzw`  | Spatial coordinates | x, y, z, w              |
| `rgba`  | Color channels      | red, green, blue, alpha |
| `stpq`  | Texture coordinates | s, t, p, q              |

## Control Structures

### Conditional Logic

```javascript
const fragment = () => {
        const position = builtin('position')

        return If(position.x.greaterThan(0), () => {
                return vec4(1, 0, 0, 1) // Red
        }).Else(() => {
                return vec4(0, 0, 1, 1) // Blue
        })
}
```

### Loops

```javascript
const fragment = () => {
        let accumulator = float(0)

        Loop(10, ({ i }) => {
                const sample = sin(float(i))
                accumulator.assign(accumulator.add(sample))
        })

        const average = accumulator.div(10)
        return vec4(average, average, average, 1.0)
}
```

### Custom Functions

```javascript
const noise = Fn(([position, scale]) => {
        const x = position.x.mul(scale)
        const y = position.y.mul(scale)

        return fract(sin(x.add(y.mul(1000))).mul(43758.5453))
}).setLayout({
        name: 'noise',
        type: 'float',
        inputs: [
                { name: 'position', type: 'vec2' },
                { name: 'scale', type: 'float' },
        ],
})

// Usage
const fragment = () => {
        const pos = builtin('position')
        const n = noise(pos.xy, 10.0)
        return vec4(n, n, n, 1.0)
}
```

## Variable Management

### Variable Creation

```javascript
const fragment = () => {
        const position = builtin('position')

        // Create a variable
        const distance = length(position.xy).toVar('distance')

        // Use the variable multiple times
        const circle1 = smoothstep(0.5, 0.45, distance)
        const circle2 = smoothstep(0.3, 0.25, distance)

        return vec4(circle1, circle2, 0, 1)
}
```

### Variable Assignment

```javascript
const fragment = () => {
        let color = vec3(0.1, 0.1, 0.2).toVar('color')

        If(someCondition, () => {
                color.assign(vec3(1, 0, 0))
        })

        return vec4(color, 1.0)
}
```

## Data Flow

### CPU to GPU

```javascript
// CPU side
gl.uniform('startTime', performance.now() / 1000)

// GPU side
const fragment = () => {
        const uv = position.xy.div(iResolution)
        const wave = sin(uv.x.mul(10).add(iTime))

        return vec4(wave, wave, wave, 1.0)
}
```

### Vertex to Fragment

```javascript
const vertex = () => {
        const position = attribute('position')
        const color = attribute('color')

        // Pass data to fragment shader
        const worldColor = vertexStage(color, 'worldColor')

        return position
}

const fragment = () => {
        const worldColor = varying('worldColor')
        return vec4(worldColor, 1.0)
}
```

## Compilation Process

### Abstract Syntax Tree

The Node System builds an Abstract Syntax Tree (AST) that represents your shader logic:

```
Expression: sin(x * 2.0 + 1.0)

AST:
    sin
     │
    add
   ┌─┴─┐
  mul   1.0
 ┌─┴─┐
 x   2.0
```

### Code Generation

The AST compiles to efficient shader code:

```javascript
// TypeScript
const wave = sin(x.mul(2.0).add(1.0))

// Generated GLSL
float wave = sin(x * 2.0 + 1.0);

// Generated WGSL
let wave: f32 = sin(x * 2.0 + 1.0);
```

## Best Practices

### Performance Tips

```javascript
// Good: Cache expensive calculations
const fragment = () => {
        const expensive = complexCalculation().toVar('expensive')

        const result1 = expensive.mul(0.5)
        const result2 = expensive.add(1.0)

        return vec4(result1, result2, 0, 1)
}

// Bad: Repeat expensive calculations
const fragment = () => {
        const result1 = complexCalculation().mul(0.5)
        const result2 = complexCalculation().add(1.0) // Calculated twice!

        return vec4(result1, result2, 0, 1)
}
```

### Type Safety

```javascript
// Good: Explicit types
const distance = length(position.xy) // Returns float
const color = vec3(distance, distance, distance) // Explicit vec3

// Good: Type conversion
const normalized = distance.toVec3() // Converts float to vec3
```

### Readability

```javascript
// Good: Descriptive variable names
const fragment = () => {
        const screenPosition = builtin('position')
        const normalizedUV = screenPosition.xy.mul(0.5).add(0.5)
        const distanceFromCenter = length(normalizedUV.sub(0.5))

        const circle = smoothstep(0.5, 0.45, distanceFromCenter)
        return vec4(circle, circle, circle, 1.0)
}
```

The Node System provides a powerful yet familiar way to write GPU shaders using TypeScript syntax and patterns.
