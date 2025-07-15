# Type System and Conversions

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
// リテラル値から
const pi = float(3.14159)
const count = int(42)
const flag = bool(true)

// 他のノードから
const computed = float(sin(angle))
const index = int(position.x.mul(10))
const condition = bool(value.greaterThan(threshold))
```

## Vector Types

### Vector Constructors

| Type   | Constructor Patterns | Components                         |
| ------ | -------------------- | ---------------------------------- |
| `vec2` | `vec2(x, y)`         | x, y                               |
| `vec2` | `vec2(scalar)`       | scalar, scalar                     |
| `vec3` | `vec3(x, y, z)`      | x, y, z                            |
| `vec3` | `vec3(vec2, z)`      | vec2.x, vec2.y, z                  |
| `vec3` | `vec3(scalar)`       | scalar, scalar, scalar             |
| `vec4` | `vec4(x, y, z, w)`   | x, y, z, w                         |
| `vec4` | `vec4(vec3, w)`      | vec3.x, vec3.y, vec3.z, w          |
| `vec4` | `vec4(vec2, vec2)`   | vec2a.x, vec2a.y, vec2b.x, vec2b.y |

### Vector Examples

```javascript
// 基本的な構築
const position2D = vec2(100, 200)
const color = vec3(1, 0.5, 0.2)
const homogeneous = vec4(position2D, 0, 1)

// スカラーからの拡張
const white = vec3(1.0) // vec3(1.0, 1.0, 1.0)
const transparent = vec4(color, 0.8)

// 他のベクトルからの構築
const normal = vec3(tangent.xy, sqrt(1.0 - dot(tangent.xy, tangent.xy)))
```

## Matrix Types

### Matrix Constructors

| Type   | Constructor | Dimensions | Element Order |
| ------ | ----------- | ---------- | ------------- |
| `mat2` | `mat2(...)` | 2×2        | Column-major  |
| `mat3` | `mat3(...)` | 3×3        | Column-major  |
| `mat4` | `mat4(...)` | 4×4        | Column-major  |

### Matrix Construction Patterns

```javascript
// 配列からの構築
const transform2D = mat2([1, 0, 0, 1])

// Identity matrix
const identity3 = mat3([1, 0, 0, 0, 1, 0, 0, 0, 1])

// Column vector construction
const rotation = mat3(vec3(cos(angle), sin(angle), 0), vec3(-sin(angle), cos(angle), 0), vec3(0, 0, 1))
```

## Type Conversion Methods

### Explicit Conversions

| Method       | Source Type | Target Type | Behavior                |
| ------------ | ----------- | ----------- | ----------------------- |
| `.toFloat()` | `any`       | `float`     | Extract first component |
| `.toInt()`   | `any`       | `int`       | Truncate to integer     |
| `.toUint()`  | `any`       | `uint`      | Convert to unsigned     |
| `.toBool()`  | `any`       | `bool`      | Non-zero → true         |
| `.toVec2()`  | `any`       | `vec2`      | Swizzle or broadcast    |
| `.toVec3()`  | `any`       | `vec3`      | Swizzle or broadcast    |
| `.toVec4()`  | `any`       | `vec4`      | Swizzle or broadcast    |

### Conversion Examples

```javascript
// スカラーからベクトルへ
const brightness = float(0.8)
const gray = brightness.toVec3() // vec3(0.8, 0.8, 0.8)

// ベクトルからスカラーへ
const position = vec3(1, 2, 3)
const x = position.toFloat() // 1.0

// ベクトル間の変換
const color3 = vec3(1, 0, 0)
const color4 = color3.toVec4() // vec4(1, 0, 0, 1)
const coord = color4.toVec2() // vec2(1, 0)
```

## Automatic Type Promotion

### Promotion Rules

| Operation  | Left Type | Right Type | Result Type |
| ---------- | --------- | ---------- | ----------- |
| Arithmetic | `float`   | `vec3`     | `vec3`      |
| Arithmetic | `int`     | `float`    | `float`     |
| Arithmetic | `vec2`    | `vec3`     | `vec3`      |
| Comparison | `float`   | `vec3`     | `bvec3`     |
| Logical    | `bool`    | `bvec2`    | `bvec2`     |

### Promotion Examples

```javascript
// スカラーとベクトルの演算
const scale = float(2.0)
const position = vec3(1, 0, 0)
const scaled = position.mul(scale) // vec3(2, 0, 0)

// 異なる次元のベクトル演算
const offset2D = vec2(0.1, 0.2)
const position3D = vec3(1, 2, 3)
const result = position3D.add(offset2D) // vec3(1.1, 2.2, 3)
```

## Swizzling System

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
const g = position.g // float(2) - same as y
const s = position.s // float(1) - same as x

// Multi-component swizzling
const xy = position.xy // vec2(1, 2)
const rgb = position.rgb // vec3(1, 2, 3)
const bgr = position.bgr // vec3(3, 2, 1)

// Repeated components
const xx = position.xx // vec2(1, 1)
const xyxy = position.xyxy // vec4(1, 2, 1, 2)
```

### Advanced Swizzling

```javascript
// Complex reordering
const original = vec4(1, 2, 3, 4)
const reordered = original.wzyx // vec4(4, 3, 2, 1)
const mixed = original.xzyw // vec4(1, 3, 2, 4)

// Cross-pattern swizzling
const color = vec4(0.8, 0.4, 0.2, 1.0)
const luminance = color.rrr // vec3(0.8, 0.8, 0.8)
const position = color.stpq // Same as color.xyzw
```

## Integer Vector Types

### Integer Vector Constructors

| Type    | Constructor         | Component Type |
| ------- | ------------------- | -------------- |
| `ivec2` | `ivec2(x, y)`       | `int`          |
| `ivec3` | `ivec3(x, y, z)`    | `int`          |
| `ivec4` | `ivec4(x, y, z, w)` | `int`          |
| `uvec2` | `uvec2(x, y)`       | `uint`         |
| `uvec3` | `uvec3(x, y, z)`    | `uint`         |
| `uvec4` | `uvec4(x, y, z, w)` | `uint`         |

### Boolean Vector Types

| Type    | Constructor         | Component Type |
| ------- | ------------------- | -------------- |
| `bvec2` | `bvec2(x, y)`       | `bool`         |
| `bvec3` | `bvec3(x, y, z)`    | `bool`         |
| `bvec4` | `bvec4(x, y, z, w)` | `bool`         |

### Specialized Vector Examples

```javascript
// Integer vectors for indexing
const indices = ivec3(0, 1, 2)
const offset = uvec2(10, 20)

// Boolean vectors for masking
const mask = bvec3(true, false, true)
const condition = position.greaterThan(vec3(0)) // Returns bvec3
```

## Type Inference Engine

### Inference Rules

```
Type Inference Flow:
    Expression
        │
    ┌───▼───┐
    │ Parse │ ──── Identify operators
    │ Tree  │      Identify operands
    └───┬───┘
        │
    ┌───▼───┐
    │Infer  │ ──── Apply promotion rules
    │Types  │      Resolve conflicts
    └───┬───┘
        │
    ┌───▼───┐
    │Result │ ──── Final type
    │ Type  │      Error checking
    └───────┘
```

### Complex Type Inference

```javascript
// 複雑な型推論の例
const a = float(2.0) // float
const b = vec3(1, 0, 0) // vec3
const c = a.add(b) // vec3 (float promoted to vec3)
const d = c.lessThan(vec3(1)) // bvec3 (comparison result)
const e = select(d, c, vec3(0)) // vec3 (conditional selection)
```

GLRE の型システムは、GLSL/WGSL の厳密な型規則を維持しながら、TypeScript の柔軟性を活用した直感的な型変換を提供します。
