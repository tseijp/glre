# Complete Function Reference

Comprehensive reference for all mathematical functions and operations in TSL.

## Mathematical Functions

### Trigonometric Functions

| Function      | Description             | Parameters                 | Return Type           | Vector Support |
| ------------- | ----------------------- | -------------------------- | --------------------- | -------------- |
| `sin(x)`      | Sine                    | `float\|vec*`              | Input type            | ✓              |
| `cos(x)`      | Cosine                  | `float\|vec*`              | Input type            | ✓              |
| `tan(x)`      | Tangent                 | `float\|vec*`              | Input type            | ✓              |
| `asin(x)`     | Arcsine                 | `float\|vec*`              | Input type            | ✓              |
| `acos(x)`     | Arccosine               | `float\|vec*`              | Input type            | ✓              |
| `atan(x)`     | Arctangent              | `float\|vec*`              | Input type            | ✓              |
| `atan2(y, x)` | Two-argument arctangent | `float\|vec*, float\|vec*` | Higher precision type | ✓              |

**Mathematical Background**: Trigonometric functions relate angles to ratios of triangle sides.

- `sin()` and `cos()` oscillate between -1 and 1
- Useful for creating wave patterns and circular motion
- Input angles are in radians (π ≈ 3.14159)

```javascript
// Basic trigonometry
const angle = uniform('angle')
const wave = sin(angle.mul(PI))
const circle = vec2(cos(angle), sin(angle))

// Multiple frequencies for complex waves
const multiWave = sin(angle.mul(3)).add(cos(angle.mul(5)).mul(0.5))
```

### Exponential Functions

| Function         | Description         | Parameters                 | Return Type           | Vector Support |
| ---------------- | ------------------- | -------------------------- | --------------------- | -------------- |
| `pow(x, y)`      | Power               | `float\|vec*, float\|vec*` | Higher precision type | ✓              |
| `pow2(x)`        | Square              | `float\|vec*`              | Input type            | ✓              |
| `pow3(x)`        | Cube                | `float\|vec*`              | Input type            | ✓              |
| `pow4(x)`        | Fourth power        | `float\|vec*`              | Input type            | ✓              |
| `sqrt(x)`        | Square root         | `float\|vec*`              | Input type            | ✓              |
| `inverseSqrt(x)` | Inverse square root | `float\|vec*`              | Input type            | ✓              |
| `exp(x)`         | Natural exponential | `float\|vec*`              | Input type            | ✓              |
| `exp2(x)`        | Base-2 exponential  | `float\|vec*`              | Input type            | ✓              |
| `log(x)`         | Natural logarithm   | `float\|vec*`              | Input type            | ✓              |
| `log2(x)`        | Base-2 logarithm    | `float\|vec*`              | Input type            | ✓              |

**Mathematical Background**: Exponential functions model growth and decay.

- `pow(x, y)` raises x to the power y
- `sqrt(x)` finds the number that when multiplied by itself equals x
- `exp(x)` is e^x, where e ≈ 2.718

```javascript
// Power and exponential functions
const distance = length(position)
const falloff = exp(distance.negate())
const brightness = pow(dot(normal, lightDir), shininess)
const octaves = log2(resolution)
```

### Common Mathematical Functions

| Function    | Description      | Parameters                 | Return Type           | Vector Support |
| ----------- | ---------------- | -------------------------- | --------------------- | -------------- |
| `abs(x)`    | Absolute value   | `float\|vec*`              | Input type            | ✓              |
| `sign(x)`   | Sign extraction  | `float\|vec*`              | Input type            | ✓              |
| `floor(x)`  | Floor function   | `float\|vec*`              | Input type            | ✓              |
| `ceil(x)`   | Ceiling function | `float\|vec*`              | Input type            | ✓              |
| `round(x)`  | Round to nearest | `float\|vec*`              | Input type            | ✓              |
| `fract(x)`  | Fractional part  | `float\|vec*`              | Input type            | ✓              |
| `trunc(x)`  | Truncate         | `float\|vec*`              | Input type            | ✓              |
| `mod(x, y)` | Modulo           | `float\|vec*, float\|vec*` | Higher precision type | ✓              |

**Mathematical Background**: These functions modify numbers in specific ways.

- `abs(x)` removes the negative sign: abs(-5) = 5
- `floor(x)` rounds down: floor(3.7) = 3
- `fract(x)` gives the decimal part: fract(3.7) = 0.7

```javascript
// Basic math function combinations
const pattern = fract(position.mul(10))
const stepped = floor(value.mul(8)).div(8)
const pingPong = abs(fract(time.mul(0.5)).mul(2).sub(1))
```

### Interpolation Functions

| Function              | Description          | Parameters                              | Return Type           | Vector Support |
| --------------------- | -------------------- | --------------------------------------- | --------------------- | -------------- |
| `min(x, y)`           | Minimum              | `float\|vec*, float\|vec*`              | Higher precision type | ✓              |
| `max(x, y)`           | Maximum              | `float\|vec*, float\|vec*`              | Higher precision type | ✓              |
| `clamp(x, min, max)`  | Clamp to range       | `float\|vec*, float\|vec*, float\|vec*` | Higher precision type | ✓              |
| `saturate(x)`         | Clamp to 0-1         | `float\|vec*`                           | Input type            | ✓              |
| `mix(x, y, a)`        | Linear interpolation | `float\|vec*, float\|vec*, float\|vec*` | Higher precision type | ✓              |
| `step(edge, x)`       | Step function        | `float\|vec*, float\|vec*`              | Higher precision type | ✓              |
| `smoothstep(a, b, x)` | Smooth step          | `float\|vec*, float\|vec*, float\|vec*` | Higher precision type | ✓              |

**Mathematical Background**: Interpolation blends between values.

- `mix(a, b, t)` blends: when t=0 returns a, when t=1 returns b
- `step(edge, x)` returns 0 if x < edge, otherwise 1
- `smoothstep()` creates smooth transitions instead of sharp jumps

```javascript
// Interpolation for smooth transitions
const gradient = smoothstep(0.2, 0.8, position.y)
const masked = mix(colorA, colorB, gradient)
const threshold = step(0.5, noise)
```

## Vector Functions

### Vector Operations

| Function         | Description             | Parameters   | Return Type | Notes              |
| ---------------- | ----------------------- | ------------ | ----------- | ------------------ |
| `length(x)`      | Vector length           | `vec*`       | `float`     | Euclidean norm     |
| `distance(x, y)` | Distance between points | `vec*, vec*` | `float`     | Euclidean distance |
| `dot(x, y)`      | Dot product             | `vec*, vec*` | `float`     | Scalar product     |
| `cross(x, y)`    | Cross product           | `vec3, vec3` | `vec3`      | 3D only            |
| `normalize(x)`   | Unit vector             | `vec*`       | Input type  | Length = 1         |
| `lengthSq(x)`    | Squared length          | `vec*`       | `float`     | Faster than length |

**Mathematical Background**: Vector operations work with directions and magnitudes.

- `length()` measures how far a point is from origin
- `dot()` measures how much two vectors point in the same direction
- `normalize()` makes a vector length 1 while keeping its direction

```javascript
// Vector operations for lighting
const lightDir = normalize(lightPos.sub(worldPos))
const intensity = max(0, dot(normal, lightDir))
const reflection = reflect(viewDir.negate(), normal)
```

### Vector Utilities

| Function                  | Description       | Parameters          | Return Type | Notes                  |
| ------------------------- | ----------------- | ------------------- | ----------- | ---------------------- |
| `reflect(I, N)`           | Reflection vector | `vec*, vec*`        | Input type  | Mirror reflection      |
| `refract(I, N, eta)`      | Refraction vector | `vec*, vec*, float` | Input type  | Snell's law            |
| `faceforward(N, I, Nref)` | Orient normal     | `vec*, vec*, vec*`  | Input type  | Consistent orientation |

```javascript
// Physical vector calculations
const reflected = reflect(incident, normal)
const refracted = refract(incident, normal, ior)
const oriented = faceforward(normal, viewDir, geometryNormal)
```

## Comparison and Logical Functions

### Comparison Operations

| Method                 | Symbol | Return Type   | Vector Support |
| ---------------------- | ------ | ------------- | -------------- |
| `.equal(x)`            | `==`   | `bool\|bvec*` | ✓              |
| `.notEqual(x)`         | `!=`   | `bool\|bvec*` | ✓              |
| `.lessThan(x)`         | `<`    | `bool\|bvec*` | ✓              |
| `.greaterThan(x)`      | `>`    | `bool\|bvec*` | ✓              |
| `.lessThanEqual(x)`    | `<=`   | `bool\|bvec*` | ✓              |
| `.greaterThanEqual(x)` | `>=`   | `bool\|bvec*` | ✓              |

### Logical Operations

| Method    | Symbol | Return Type   | Vector Support |
| --------- | ------ | ------------- | -------------- |
| `.and(x)` | `&&`   | `bool\|bvec*` | ✓              |
| `.or(x)`  | `\|\|` | `bool\|bvec*` | ✓              |
| `.not()`  | `!`    | `bool\|bvec*` | ✓              |
| `.xor(x)` | `^^`   | `bool\|bvec*` | ✓              |

### Boolean Vector Functions

| Function | Description         | Parameters | Return Type | Notes       |
| -------- | ------------------- | ---------- | ----------- | ----------- |
| `all(x)` | All components true | `bvec*`    | `bool`      | Logical AND |
| `any(x)` | Any component true  | `bvec*`    | `bool`      | Logical OR  |
| `not(x)` | Component-wise NOT  | `bvec*`    | Input type  | Logical NOT |

```javascript
// Logical operations
const inBounds = all(position.greaterThan(vec3(0)).and(position.lessThan(vec3(1))))
const hasColor = any(color.greaterThan(vec3(0)))
```

## Derivative Functions

| Function    | Description            | Parameters    | Return Type | Fragment Only |
| ----------- | ---------------------- | ------------- | ----------- | ------------- |
| `dFdx(x)`   | X-direction derivative | `float\|vec*` | Input type  | ✓             |
| `dFdy(x)`   | Y-direction derivative | `float\|vec*` | Input type  | ✓             |
| `fwidth(x)` | Derivative width       | `float\|vec*` | Input type  | ✓             |

**Mathematical Background**: Derivatives measure how fast something changes.

- `dFdx()` shows how much a value changes between neighboring pixels horizontally
- `dFdy()` shows vertical change
- Used for anti-aliasing and normal calculation

```javascript
// Derivatives for surface normals and anti-aliasing
const normalFromHeight = normalize(vec3(dFdx(heightmap).negate(), dFdy(heightmap).negate(), 1))

const antialiasing = smoothstep(0, fwidth(pattern), pattern)
```

## Utility Functions

### Custom Utility Functions

| Function                    | Description   | Parameters         | Return Type | Notes             |
| --------------------------- | ------------- | ------------------ | ----------- | ----------------- |
| `oneMinus(x)`               | One minus x   | `float\|vec*`      | Input type  | 1 - x             |
| `negate(x)`                 | Negate value  | `float\|vec*`      | Input type  | -x                |
| `reciprocal(x)`             | Reciprocal    | `float\|vec*`      | Input type  | 1/x               |
| `remap(x, a, b, c, d)`      | Remap range   | `float\|vec*, ...` | Input type  | Linear remapping  |
| `remapClamp(x, a, b, c, d)` | Clamped remap | `float\|vec*, ...` | Input type  | Clamped remapping |

```javascript
// Utility function applications
const inverted = oneMinus(brightness)
const normalized = remap(worldPos.y, -100, 100, 0, 1)
const safety = reciprocal(max(EPSILON, denominator))
```

## Geometric Functions

### 2D Transformations

| Function             | Description | Parameters          | Return Type | Notes               |
| -------------------- | ----------- | ------------------- | ----------- | ------------------- |
| `rotate(pos, angle)` | 2D rotation | `vec2, float`       | `vec2`      | Around origin       |
| `scale(pos, factor)` | 2D scaling  | `vec2, vec2\|float` | `vec2`      | Non-uniform scaling |

```javascript
// 2D geometric transformations
const rotated = rotate(uv.sub(0.5), time).add(0.5)
const scaled = scale(uv, vec2(2, 1))
```

## Noise and Random Functions

### Pseudorandom Functions

| Function          | Description   | Parameters     | Return Type | Notes           |
| ----------------- | ------------- | -------------- | ----------- | --------------- |
| `hash(seed)`      | Hash function | `float\|vec*`  | `float`     | 0-1 range       |
| `range(min, max)` | Random range  | `float, float` | `float`     | Attribute-based |

**Mathematical Background**: Pseudorandom functions create seemingly random values from deterministic inputs.

```javascript
// Random function usage
const randomValue = hash(position.add(time))
const randomColor = vec3(hash(position), hash(position.add(1)), hash(position.add(2)))
```

## Oscillator Functions

### Wave Generation

| Function         | Description   | Parameters | Return Type | Notes   |
| ---------------- | ------------- | ---------- | ----------- | ------- |
| `oscSine(t)`     | Sine wave     | `float`    | `float`     | -1 to 1 |
| `oscSquare(t)`   | Square wave   | `float`    | `float`     | -1 to 1 |
| `oscTriangle(t)` | Triangle wave | `float`    | `float`     | -1 to 1 |
| `oscSawtooth(t)` | Sawtooth wave | `float`    | `float`     | -1 to 1 |

```javascript
// Oscillator function combinations
const wave = oscSine(time.mul(2))
        .add(oscTriangle(time.mul(4)).mul(0.5))
        .add(oscSquare(time.mul(8)).mul(0.25))
```

## Color Space Functions

### Color Utilities

| Function                | Description        | Parameters | Return Type | Notes           |
| ----------------------- | ------------------ | ---------- | ----------- | --------------- |
| `directionToColor(dir)` | Direction to color | `vec3`     | `vec3`      | Normal encoding |
| `colorToDirection(col)` | Color to direction | `vec3`     | `vec3`      | Normal decoding |

```javascript
// Color space conversions
const encoded = directionToColor(normal)
const decoded = colorToDirection(normalTexture)
```

## Blend Mode Functions

### Color Blending

| Function             | Description   | Parameters   | Return Type | Notes        |
| -------------------- | ------------- | ------------ | ----------- | ------------ |
| `blendBurn(a, b)`    | Burn blend    | `vec3, vec3` | `vec3`      | Color burn   |
| `blendDodge(a, b)`   | Dodge blend   | `vec3, vec3` | `vec3`      | Color dodge  |
| `blendOverlay(a, b)` | Overlay blend | `vec3, vec3` | `vec3`      | Overlay mode |
| `blendScreen(a, b)`  | Screen blend  | `vec3, vec3` | `vec3`      | Screen mode  |
| `blendColor(a, b)`   | Normal blend  | `vec3, vec3` | `vec3`      | Alpha blend  |

```javascript
// Blend mode applications
const result = blendOverlay(baseColor, overlayColor)
const highlight = blendScreen(color, lightColor)
```

## Control Flow Functions

### Conditional Functions

| Function                                   | Description           | Parameters              | Return Type |
| ------------------------------------------ | --------------------- | ----------------------- | ----------- |
| `select(condition, trueValue, falseValue)` | Conditional selection | `bool\|bvec*, any, any` | Input type  |

```javascript
// Conditional selection
const color = select(
        position.x.greaterThan(0),
        vec3(1, 0, 0), // Red
        vec3(0, 0, 1) // Blue
)
```

## Function Composition

### Combining Functions

Functions can be chained and combined to create complex behaviors:

```javascript
// Complex function composition
const complexPattern = (position, time) => {
        const transformed = rotate(position.mul(2), time.mul(0.5))
        const noise1 = hash(transformed.add(time))
        const noise2 = hash(transformed.mul(2).add(time.mul(1.3)))

        const combined = mix(noise1, noise2, sin(time).mul(0.5).add(0.5))
        return smoothstep(0.3, 0.7, combined)
}
```

Node System provides 150+ mathematical functions covering all aspects of GPU programming, from basic arithmetic to advanced geometric transformations.
