# Type System and Conversions

Complete reference for GLRE's type system and automatic conversions.

## Scalar Types

### Basic Scalar Types

| Type    | Constructor    | Range           | GLSL/WGSL Equivalent |
| ------- | -------------- | --------------- | -------------------- |
| `float` | `float(value)` | IEEE 754 32-bit | `float` / `f32`      |
| `int`   | `int(value)`   | -2³¹ to 2³¹-1   | `int` / `i32`        |
| `uint`  | `uint(value)`  | 0 to 2³²-1      | `uint` / `u32`       |
| `bool`  | `bool(value)`  | true/false      | `bool` / `bool`      |

### Scalar Construction

```javascript
// From literal values
const pi = float(3.14159)
const count = int(42)
const flag = bool(true)

// From other nodes
const computed = float(sin(angle))
const index = int(position.x.mul(10))
const condition = bool(value.greaterThan(threshold))
```

### Number System Basics

For beginners: Numbers in programming represent different types of values:

- **Integers** (int): Whole numbers like 1, 2, 100, -5
- **Floating point** (float): Decimal numbers like 3.14, 0.5, -2.7
- **Boolean** (bool): True or false values

## Vector Types

### Vector Constructors

Vectors are collections of numbers. Think of them as:

- `vec2`: A point on a 2D plane (x, y)
- `vec3`: A point in 3D space (x, y, z) or RGB color (red, green, blue)
- `vec4`: 3D point with transparency (x, y, z, w) or RGBA color

| Type   | Constructor Patterns | Components                |
| ------ | -------------------- | ------------------------- |
| `vec2` | `vec2(x, y)`         | x, y                      |
| `vec2` | `vec2(scalar)`       | scalar, scalar            |
| `vec3` | `vec3(x, y, z)`      | x, y, z                   |
| `vec3` | `vec3(vec2, z)`      | vec2.x, vec2.y, z         |
| `vec3` | `vec3(scalar)`       | scalar, scalar, scalar    |
| `vec4` | `vec4(x, y, z, w)`   | x, y, z, w                |
| `vec4` | `vec4(vec3, w)`      | vec3.x, vec3.y, vec3.z, w |

### Vector Examples

```javascript
// Basic construction
const position2D = vec2(100, 200) // Point at (100, 200)
const color = vec3(1, 0.5, 0.2) // Orange color
const colorWithAlpha = vec4(color, 0.8) // Orange with 80% opacity

// Scalar expansion
const white = vec3(1.0) // Same as vec3(1.0, 1.0, 1.0)
const gray = vec4(0.5) // Same as vec4(0.5, 0.5, 0.5, 0.5)

// Combining vectors
const xy = vec2(0.5, 0.3)
const z = float(0.8)
const xyz = vec3(xy, z) // Combines 2D + 1D = 3D
```

### Vector Math Basics

Vectors can be added, subtracted, and scaled:

```javascript
const a = vec2(1, 2)
const b = vec2(3, 4)

// Addition: add corresponding components
const sum = a.add(b) // vec2(1+3, 2+4) = vec2(4, 6)

// Subtraction: subtract corresponding components
const diff = a.sub(b) // vec2(1-3, 2-4) = vec2(-2, -2)

// Scaling: multiply all components by same number
const scaled = a.mul(2) // vec2(1*2, 2*2) = vec2(2, 4)
```

## Matrix Types

### Matrix Basics

Matrices are grids of numbers used for transformations (moving, rotating, scaling objects):

| Type   | Constructor | Dimensions | Common Use        |
| ------ | ----------- | ---------- | ----------------- |
| `mat2` | `mat2(...)` | 2×2        | 2D rotation       |
| `mat3` | `mat3(...)` | 3×3        | 2D transformation |
| `mat4` | `mat4(...)` | 4×4        | 3D transformation |

### Matrix Construction

```javascript
// Identity matrix (no transformation)
const identity2 = mat2([1, 0, 0, 1])

const identity3 = mat3([1, 0, 0, 0, 1, 0, 0, 0, 1])

// 2D rotation matrix
const angle = 0.5 // radians
const rotation = mat2([cos(angle), -sin(angle), sin(angle), cos(angle)])
```

## Type Conversions

### Explicit Conversions

| Method       | Source Type | Target Type | Behavior                |
| ------------ | ----------- | ----------- | ----------------------- |
| `.toFloat()` | `any`       | `float`     | Extract first component |
| `.toInt()`   | `any`       | `int`       | Truncate to integer     |
| `.toBool()`  | `any`       | `bool`      | Non-zero → true         |
| `.toVec2()`  | `any`       | `vec2`      | Swizzle or broadcast    |
| `.toVec3()`  | `any`       | `vec3`      | Swizzle or broadcast    |
| `.toVec4()`  | `any`       | `vec4`      | Swizzle or broadcast    |

### Conversion Examples

```javascript
// Scalar to vector (broadcasting)
const brightness = float(0.8)
const gray = brightness.toVec3() // vec3(0.8, 0.8, 0.8)

// Vector to scalar (extract first component)
const position = vec3(1, 2, 3)
const x = position.toFloat() // 1.0

// Vector size changes
const color3 = vec3(1, 0, 0) // Red color
const color4 = color3.toVec4() // vec4(1, 0, 0, 1) - adds alpha
const coord = color4.toVec2() // vec2(1, 0) - takes first two
```

## Automatic Type Promotion

### Promotion Rules

When different types are combined, GLRE automatically promotes to the "larger" type:

| Operation  | Left Type | Right Type | Result Type | Explanation                             |
| ---------- | --------- | ---------- | ----------- | --------------------------------------- |
| Arithmetic | `float`   | `vec3`     | `vec3`      | Float becomes vec3(float, float, float) |
| Arithmetic | `int`     | `float`    | `float`     | Integer becomes floating point          |
| Arithmetic | `vec2`    | `vec3`     | `vec3`      | vec2 becomes vec3(vec2.x, vec2.y, 0)    |
| Comparison | `float`   | `vec3`     | `bvec3`     | Compares float with each component      |

### Promotion Examples

```javascript
// Scalar with vector
const scale = float(2.0)
const position = vec3(1, 0, 0)
const scaled = position.mul(scale) // vec3(2, 0, 0)
// scale becomes vec3(2, 2, 2) automatically

// Different vector sizes
const offset2D = vec2(0.1, 0.2)
const position3D = vec3(1, 2, 3)
const result = position3D.add(offset2D) // vec3(1.1, 2.2, 3)
// offset2D becomes vec3(0.1, 0.2, 0) automatically
```

## Swizzling System

### What is Swizzling?

Swizzling lets you rearrange or extract components from vectors using letters:

### Swizzling Patterns

| Pattern | Coordinate System | Components              |
| ------- | ----------------- | ----------------------- |
| `xyzw`  | Spatial           | x, y, z, w              |
| `rgba`  | Color             | red, green, blue, alpha |
| `stpq`  | Texture           | s, t, p, q              |

### Swizzling Examples

```javascript
const position = vec4(1, 2, 3, 4)

// Single component access
const x = position.x // float(1)
const green = position.g // float(2) - same as y
const s = position.s // float(1) - same as x

// Multi-component swizzling
const xy = position.xy // vec2(1, 2)
const rgb = position.rgb // vec3(1, 2, 3)
const bgr = position.bgr // vec3(3, 2, 1) - reversed!

// Repeated components
const xx = position.xx // vec2(1, 1)
const xyxy = position.xyxy // vec4(1, 2, 1, 2)
```

### Advanced Swizzling

```javascript
// Complex reordering
const original = vec4(1, 2, 3, 4)
const reordered = original.wzyx // vec4(4, 3, 2, 1) - completely reversed
const mixed = original.xzyw // vec4(1, 3, 2, 4) - custom order

// Cross-pattern swizzling
const color = vec4(0.8, 0.4, 0.2, 1.0)
const luminance = color.rrr // vec3(0.8, 0.8, 0.8) - all red
const textureCoord = color.st // vec2(0.8, 0.4) - same as xy
```

## Boolean Vector Types

### Boolean Vectors

Boolean vectors store true/false values for each component:

| Type    | Constructor         | Component Type | Usage    |
| ------- | ------------------- | -------------- | -------- |
| `bvec2` | `bvec2(x, y)`       | `bool`         | 2D masks |
| `bvec3` | `bvec3(x, y, z)`    | `bool`         | 3D masks |
| `bvec4` | `bvec4(x, y, z, w)` | `bool`         | 4D masks |

### Boolean Vector Examples

```javascript
// Create boolean vectors
const mask = bvec3(true, false, true)

// From comparisons
const position = vec3(1, -2, 3)
const positive = position.greaterThan(vec3(0)) // bvec3(true, false, true)

// Logical operations
const all = all(positive) // bool: are ALL components true?
const any = any(positive) // bool: is ANY component true?
const inverted = not(positive) // bvec3(false, true, false)
```

## Type Inference Engine

### How Type Inference Works

GLRE automatically figures out what type each operation should return:

1. **Operator Type Rules**: Addition of two floats returns float
2. **Function Return Types**: `sin()` of any type returns same type
3. **Comparison Results**: Comparisons always return boolean types
4. **Promotion Rules**: Mixed operations promote to larger type

### Complex Type Inference

```javascript
// The system tracks types through complex expressions
const a = float(2.0) // float
const b = vec3(1, 0, 0) // vec3
const c = a.add(b) // vec3 (float promoted)
const d = c.lessThan(vec3(1)) // bvec3 (comparison result)
const e = select(d, c, vec3(0)) // vec3 (conditional selection)
```

## Type Safety Features

### Compile-Time Checking

GLRE catches type errors before they reach the GPU:

```javascript
// This would cause a type error:
// const invalid = vec3(1, 2, 3).dot(float(5))  // Error: dot needs two vectors

// Correct version:
const valid = vec3(1, 2, 3).dot(vec3(5, 0, 0)) // OK: dot product of vectors
```

### Runtime Type Information

```javascript
// Check types at runtime
const checkType = (node) => {
        if (node.type === 'vec3') {
                console.log('This is a 3D vector')
        } else if (node.type === 'float') {
                console.log('This is a number')
        }
}
```

## Integer Vector Types

### Integer Vectors

Vectors can also hold integer values:

| Type    | Constructor         | Component Type | Usage                        |
| ------- | ------------------- | -------------- | ---------------------------- |
| `ivec2` | `ivec2(x, y)`       | `int`          | Integer 2D coordinates       |
| `ivec3` | `ivec3(x, y, z)`    | `int`          | Integer 3D coordinates       |
| `ivec4` | `ivec4(x, y, z, w)` | `int`          | Integer 4D coordinates       |
| `uvec2` | `uvec2(x, y)`       | `uint`         | Unsigned integer coordinates |

### Integer Vector Examples

```javascript
// Integer vectors for array indexing
const indices = ivec3(0, 1, 2)
const offset = uvec2(10, 20)

// Useful for grid coordinates
const gridX = int(position.x.mul(10))
const gridY = int(position.y.mul(10))
const gridCoord = ivec2(gridX, gridY)
```

The GLRE type system provides safety and convenience while maintaining the performance and flexibility needed for GPU programming.
