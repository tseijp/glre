# GLRE Reactive GPU Engine Design Specification

## Overview

GLRE is a reactive engine that bridges CPU-side JavaScript code with GPU-side shader code.
It supports both WebGL2 and WebGPU, allowing direct GLSL or WGSL shader authoring
as well as shader generation through a TypeScript-like node system.

## Architecture Composition

### CPU-GPU Binding Automation System

The core functionality is to automatically construct configurations
for transmitting CPU-side data to GPU-side shader programs.
This process is managed by the createGL function in `src/index.ts`,
which abstracts the differences between WebGL2 and WebGPU.

The createGL function uses the reev library's event function to generate a reactive GL instance.
This instance automatically queues uniform, attribute,
and texture data settings and transfers them to the GPU at timing.

### WebGL2 Backend Implementation

webgl.ts implements an OpenGL ES 3.0-based rendering pipeline.
This implementation adopts a functional approach rather than class-based,
leveraging closures to manage private state.

After initializing the shader program from the WebGL context,
uniform and attribute locations are cached using nested functions.
The render, clean functions, and configuration functions
(`_uniform`, `_attribute`, `_texture`) are returned as values,
which are then merged into the original gl object via reev's event function.

### WebGPU Backend Implementation

webgpu.ts implements a rendering pipeline using the WebGPU API.
Unlike the WebGL backend, pipeline initialization is executed during the render phase.

This is because buffer and bindGroup layouts need to be constructed
after attribute and uniform settings are added to gl.queue and processed through flush operations.
The cached function is used to cache uniforms, textures, and attribs data,
and GPU resources are constructed using createVertexBuffers, createBindGroup,
and createPipeline functions based on this information.

## Node System Details

### Abstract Syntax Tree Construction Mechanism

The node system is a DSL (Domain Specific Language)
for generating GLSL/WGSL shader code from JavaScript code.
The create function in create.ts constructs abstract syntax trees
with argument formats identical to React.createElement.

NodeProxy objects construct dynamic abstract syntax trees
through getter/setter methods using the Proxy pattern.
They have type, props, and children properties,
and these relationships are analyzed by code function and converted to shader code.

```
Abstract Syntax Tree Example:
       operator(+)
      /          \
  uniform(a)   uniform(b)
```

### Code Generation Process

code function provides core functionality for converting abstract syntax trees to string-based shader code.
This function performs conditional branching based on type and generates strings compatible
with both WebGL (GLSL) and WebGPU (WGSL).

The generation process is classified into three categories: variables, scopes, and headers.
Variables handle basic operator one-liner generation, scopes manage multi-line processing,
and headers contain definitions added to the beginning of the entire shader.

Through NodeContext, post-processing required after completing builds of all nodes is managed,
such as struct integration of uniforms and topological sorting of dependencies.

### Type Inference System

infer.ts implements functionality for inferring shader types from node trees.
This is not TypeScript type inference, but a system that determines types for GLSL/WGSL generation at JavaScript runtime.

Type inference determines return types based on operators, functions, and variables.
For example, comparison operators always return bool, and operations between vec types return vec types of dimensions.

### Scope Management System

scope.ts provides functionality for generating multi-line code.
It manages current scope context using let scope and let define variables.

Lines are added to specified scopes via the addToScope function,
and the scoped function temporarily switches to specific scopes to execute processing.
Code structures like If, Loop, and Switch use this mechanism to generate nested code.

## GPU Resource Management

### Pipeline Construction Automation

pipeline.ts provides resource management functionality for WebGPU.
The createBindings function automatically assigns group and binding numbers
for uniform, texture, and attribute resources.

This number assignment must match between shader code generation and GPU resource creation,
so it's referenced by parseUniformHead and parseAttribHead functions in parse.ts.

### Buffer Management System

The createUniformBuffer and createAttribBuffer functions generate
GPU-ready Float32Array and GPUBuffer from JavaScript number arrays.
Uniform buffers are aligned to 256-byte boundaries,
and attribute buffers are created with sizes based on vertex data stride.

## Rendering Pipeline Integration

### Shader Compilation Flow

webgl.ts and webgpu.ts call fragment and vertex functions to generate string-format shader code.
These functions are defined in node/index.ts and manage conversion from NodeProxy to final GLSL/WGSL code.

Generated shader code is initialized as GPU programs via the createProgram function
for WebGL and createPipeline function for WebGPU.

### Reactive Update Mechanism

Using reev library's durable function, uniform, attribute, and texture configuration functions are queued.
This ensures that value changes from JavaScript code are automatically reflected on the GPU.

Update cycles are triggered by gl.queue.flush(), sending accumulated changes to the GPU in batches.
This approach achieves efficient updates per rendering frame.

## Implementation Guidelines

### Node System Usage Considerations

When using the node system, generate NodeProxy objects from factory functions in node.ts
(uniform, attribute, constant, etc.) and combine them to construct abstract syntax trees.

Use the toVar() method for variable declarations and the assign() method for value assignments.
Use the Fn() function to define custom functions and explicitly specify argument
and return types with the setLayout() method.

### Direct Shader Code Usage Guidelines

When writing GLSL or WGSL directly without using the node system,
pass them as strings to the vs and fs properties of createGL.
Even in this case, uniform, attribute, and texture configurations
are performed through methods of the GL instance.

Uniform names and attribute names used in shader code must match those on the JavaScript side.
For WebGPU, group and binding numbers must also be configured.

### Design Principles for Error Avoidance

Understanding the design patterns of NodeProxy children arrays is important.
For example, in If nodes, conditions and scopes are arranged alternately,
and when the last element is Else, it's placed without conditions.

When defining structs, topological sorting of dependencies is executed,
so designs that avoid circular references are necessary.
Since uniform group/binding numbers are automatically assigned,
manual specification is discouraged.

# TypeScript Coding Style Guide

## Core Design Philosophy

### Functional Programming Implementation

Use closure-based constructor patterns instead of class keywords.
This provides private variable access control and state management.

Complete initialization at the beginning of constructor functions,
define private variables and methods, then return only necessary elements as public APIs.
This maintains encapsulation principles while utilizing JavaScript characteristics.

### TypeScript Type Safety Application

Use TypeScript as type hints, avoiding code complexity from elaborate type definitions.
Maintain JavaScript as the primary language while gaining type inference benefits,
balancing implementation flexibility with development efficiency.

When complex types are needed, temporarily use leverage the as keyword for type bridging.
Prioritize implementation simplicity over type safety to reduce cognitive load and focus on problem-solving.

## Code Structure and File Organization

### File Division Principles

Target approximately 100 lines per file to clarify responsibility boundaries.
File names should be determinable with single words;
multiple words indicate the need for directory structure revision.

Adopt the pattern of types.ts, const.ts, config.ts, index.ts as the file structure.
This configuration makes each file's role self-evident and unifies developer understanding.

## Naming Conventions and Consistency

### Variable and Function Naming Patterns

Use camelCase for lowercase-starting identifiers, with boolean variables beginning with the is prefix.
Avoid the has prefix to express state clearly.
Function names start with verbs to indicate their functionality.

Use PascalCase for uppercase-starting identifiers, applying to type and interface definitions.
Prioritize interface usage, emphasizing extends compatibility.
Use the type keyword only when interface cannot define constructs like typeof operators or union types.

### File Names and Directory Structure

Avoid camelCase in file names, composing them with simple words.
Determine package subdirectories considering convenience when used as import paths.

## Formatting Specifications

### Structure Enforcement Through Indentation

Enhance code structure visualization with 8-character space indentation.
This configuration makes 3+ level indentation difficult to read,
naturally promoting function division and refactoring.

Ensure adequate length with 120-character line width limits and achieve code conciseness with semicolon-free settings.
Unify string notation through single quote usage.

### Conditional Statement Writing

Define complex conditions as boolean variables beforehand to clarify conditional intent.
Aggregate conditions like `const isValid = condition1 && condition2`
and utilize early returns in if statements as `if (isValid) return`.

## Implementation Pattern Unification

### Closure-Based Constructor Pattern

Adopt the form `const createInstance = (args) => {}` as constructor functions,
ompleting initialization at the function's beginning.
Define private variables with `let` or `const` and return public APIs as objects at the end.

good: `const createRenderer = (config) => { const context = initContext(config); const render = () => context.draw(); return { render } }`

### Branching Pattern Unification

Implement branching logic using if-return patterns instead of switch keywords.
This pattern prevents conditional complexity and maintains independence of each branch.

good: `const getFormat = (count) => { if (count === 2) return 'vec2'; if (count === 3) return 'vec3'; return 'float' }`

### Emphasis on Symmetry

Maintain structural symmetry between related functions and modules.
Apply consistent patterns for paired operations like input-output,
initialization-destruction, and setting-getting to improve system comprehensibility.

## Type Definitions and Constraints

### Type Safety Implementation

Prioritize interface definitions to clarify object structure.
Utilize union type enumeration expressions and avoid enum keyword usage.

### Function Definition Unification

Use const arrow functions instead of function declarations.
This unification clarifies function characteristics and prevents unintended behavior from hoisting.

## Error Handling and Logging Restrictions

### Simple Implementation Maintenance

Avoid try-catch constructs and console.log usage to preserve code simplicity.
When error handling is necessary, utilize function return values or Promise rejection to encourage proper handling at call sites.
To avoid implementation complexity, refrain from excessive type safety checks and emphasize runtime flexibility.

## Import and Export Structure

### Module Management Optimization

Arrange import statements in the order of external libraries,
project helpers, utilities, and type definitions.

Group type imports at the end, clearly separating them from value imports.
Minimize default export usage and emphasize explicit API design through named exports.

## Function Internal Structuring

### Line Spacing Management

Minimize line insertion within functions to increase processing density.
Place const declarations closely together and open spacing
when transitioning to let to visually represent variable role changes.

Establish clear spacing between functions to emphasize each function's independence.
This management enables code placement within the 100-line constraint.

# Node System Language Specification

## Fundamental Concepts

The GLRE node system is a domain-specific language for generating GLSL/WGSL shader code from JavaScript.
This system provides a mechanism for constructing abstract syntax trees and converting them to target shader languages.

```
JavaScript DSL        Abstract Syntax Tree    Shader Code
┌─────────────┐      ┌─────────────┐        ┌─────────────┐
│vec4(1,0,0,1)│ ───→ │ NodeProxy   │   ───→ │vec4(1,0,0,1)│
│.mul(2.0)    │      │ children[]  │        │* 2.0        │
│.add(pos)    │      │ type/props  │        │+ position   │
└─────────────┘      └─────────────┘        └─────────────┘
```

## Node Construction System

### NodeProxy Architecture

NodeProxy objects implement method chaining and dynamic property access using the Proxy pattern.
Each NodeProxy has a structure of type, props, and children, which combine to form abstract syntax trees.

```
NodeProxy Structure:
┌─────────────────┐
│  NodeProxy      │
├─────────────────┤
│ type: string    │ ── Node type
│ props: object   │ ── Properties
│ children: []    │ ── Child nodes array
│ listeners: Set  │ ── Event listeners
└─────────────────┘
```

The getter determines operator, function, conversion, and swizzling operations based on property names and returns NodeProxies.
The setter manages value updates using the listener pattern.

### Abstract Syntax Tree Structure

Abstract syntax trees are binary tree structures but support variable-length child nodes using the children property.
This enables expression of function arguments and conditional branches in If statements.

```
Function Call Example:
    function_node
    /     |     \
 func_name arg1  arg2
```

## Type System and Conversions

### Basic Type Definitions

The type system provides shader types: float, int, bool, vec2, vec3, vec4, mat2, mat3, and mat4.
Each type is generated through factory functions and inferred through type inference.

| Type    | Factory Function   | Description           | GLSL/WGSL Mapping      |
| ------- | ------------------ | --------------------- | ---------------------- |
| `float` | `float(value)`     | 32-bit floating point | `float` / `f32`        |
| `int`   | `int(value)`       | 32-bit integer        | `int` / `i32`          |
| `bool`  | `bool(value)`      | Boolean value         | `bool` / `bool`        |
| `vec2`  | `vec2(x, y)`       | 2D vector             | `vec2` / `vec2<f32>`   |
| `vec3`  | `vec3(x, y, z)`    | 3D vector             | `vec3` / `vec3<f32>`   |
| `vec4`  | `vec4(x, y, z, w)` | 4D vector             | `vec4` / `vec4<f32>`   |
| `mat2`  | `mat2(...)`        | 2x2 matrix            | `mat2` / `mat2x2<f32>` |
| `mat3`  | `mat3(...)`        | 3x3 matrix            | `mat3` / `mat3x3<f32>` |
| `mat4`  | `mat4(...)`        | 4x4 matrix            | `mat4` / `mat4x4<f32>` |

### Type Conversion Methods

| Method Name  | Return Type | Description               |
| ------------ | ----------- | ------------------------- |
| `.toFloat()` | `float`     | Convert to floating point |
| `.toInt()`   | `int`       | Convert to integer        |
| `.toBool()`  | `bool`      | Convert to boolean        |
| `.toVec2()`  | `vec2`      | Convert to 2D vector      |
| `.toVec3()`  | `vec3`      | Convert to 3D vector      |
| `.toVec4()`  | `vec4`      | Convert to 4D vector      |
| `.toColor()` | `vec3`      | Convert to color          |
| `.toMat2()`  | `mat2`      | Convert to 2x2 matrix     |
| `.toMat3()`  | `mat3`      | Convert to 3x3 matrix     |
| `.toMat4()`  | `mat4`      | Convert to 4x4 matrix     |

Type conversions support explicit conversion functions (toFloat(), toVec3(), etc.) and automatic type promotion.
In operations between float and vec3, float is broadcast to vec3.

### Type Inference Mechanism

The type inference engine analyzes node trees at runtime to determine return types for each node.
For operator type inference, it compares type priorities of left and right operands and selects the higher priority type as the result type.

Comparison operators return bool type.
Logical operators return bool type.
In operations between vector types, higher-dimensional vector types take priority.

## Operator System

### Arithmetic Operators

| Operator Method | Symbol | Description    | Return Type          |
| --------------- | ------ | -------------- | -------------------- |
| `.add(x)`       | `+`    | Addition       | Higher priority type |
| `.sub(x)`       | `-`    | Subtraction    | Higher priority type |
| `.mul(x)`       | `*`    | Multiplication | Higher priority type |
| `.div(x)`       | `/`    | Division       | Higher priority type |
| `.mod(x)`       | `%`    | Modulo         | Higher priority type |

### Comparison Operators

| Operator Method        | Symbol | Description           | Return Type |
| ---------------------- | ------ | --------------------- | ----------- |
| `.equal(x)`            | `==`   | Equality              | `bool`      |
| `.notEqual(x)`         | `!=`   | Inequality            | `bool`      |
| `.lessThan(x)`         | `<`    | Less than             | `bool`      |
| `.greaterThan(x)`      | `>`    | Greater than          | `bool`      |
| `.lessThanEqual(x)`    | `<=`   | Less than or equal    | `bool`      |
| `.greaterThanEqual(x)` | `>=`   | Greater than or equal | `bool`      |

### Logical Operators

| Operator Method | Symbol | Description | Return Type |
| --------------- | ------ | ----------- | ----------- |
| `.and(x)`       | `&&`   | Logical AND | `bool`      |
| `.or(x)`        | `\|\|` | Logical OR  | `bool`      |
| `.not()`        | `!`    | Logical NOT | `bool`      |
| `.xor(x)`       | `^^`   | Logical XOR | `bool`      |

### Bitwise Operators

| Operator Method  | Symbol | Description | Return Type |
| ---------------- | ------ | ----------- | ----------- |
| `.bitAnd(x)`     | `&`    | Bitwise AND | Input type  |
| `.bitOr(x)`      | `\|`   | Bitwise OR  | Input type  |
| `.bitXor(x)`     | `^`    | Bitwise XOR | Input type  |
| `.bitNot()`      | `~`    | Bitwise NOT | Input type  |
| `.shiftLeft(x)`  | `<<`   | Left shift  | Input type  |
| `.shiftRight(x)` | `>>`   | Right shift | Input type  |

### Assignment Operators

| Operator Method        | Symbol | Description               | Return Type           |
| ---------------------- | ------ | ------------------------- | --------------------- | ---------- |
| `.addAssign(x)`        | `+=`   | Addition assignment       | Input type            |
| `.subAssign(x)`        | `-=`   | Subtraction assignment    | Input type            |
| `.mulAssign(x)`        | `*=`   | Multiplication assignment | Input type            |
| `.divAssign(x)`        | `/=`   | Division assignment       | Input type            |
| `.modAssign(x)`        | `%=`   | Modulo assignment         | Input type            |
| `.bitAndAssign(x)`     | `&=`   | Bitwise AND assignment    | Input type            |
| `.bitOrAssign(x)`      | `      | =`                        | Bitwise OR assignment | Input type |
| `.bitXorAssign(x)`     | `^=`   | Bitwise XOR assignment    | Input type            |
| `.shiftLeftAssign(x)`  | `<<=`  | Left shift assignment     | Input type            |
| `.shiftRightAssign(x)` | `>>=`  | Right shift assignment    | Input type            |

## Mathematical Function Library

### Trigonometric Functions

| Function      | Description             | Argument Type | Return Type          |
| ------------- | ----------------------- | ------------- | -------------------- |
| `sin(x)`      | Sine                    | Scalar/Vector | Input type           |
| `cos(x)`      | Cosine                  | Scalar/Vector | Input type           |
| `tan(x)`      | Tangent                 | Scalar/Vector | Input type           |
| `asin(x)`     | Arcsine                 | Scalar/Vector | Input type           |
| `acos(x)`     | Arccosine               | Scalar/Vector | Input type           |
| `atan(x)`     | Arctangent              | Scalar/Vector | Input type           |
| `atan2(y, x)` | Two-argument arctangent | Scalar/Vector | Higher priority type |

### Exponential Functions

| Function         | Description         | Argument Type | Return Type          |
| ---------------- | ------------------- | ------------- | -------------------- |
| `pow(x, y)`      | Power               | Scalar/Vector | Higher priority type |
| `pow2(x)`        | Square              | Scalar/Vector | Input type           |
| `pow3(x)`        | Cube                | Scalar/Vector | Input type           |
| `pow4(x)`        | Fourth power        | Scalar/Vector | Input type           |
| `sqrt(x)`        | Square root         | Scalar/Vector | Input type           |
| `inverseSqrt(x)` | Inverse square root | Scalar/Vector | Input type           |
| `exp(x)`         | Natural exponential | Scalar/Vector | Input type           |
| `exp2(x)`        | Base-2 exponential  | Scalar/Vector | Input type           |
| `log(x)`         | Natural logarithm   | Scalar/Vector | Input type           |
| `log2(x)`        | Base-2 logarithm    | Scalar/Vector | Input type           |

### Common Mathematical Functions

| Function                      | Description          | Argument Type | Return Type          |
| ----------------------------- | -------------------- | ------------- | -------------------- |
| `abs(x)`                      | Absolute value       | Scalar/Vector | Input type           |
| `sign(x)`                     | Sign                 | Scalar/Vector | Input type           |
| `floor(x)`                    | Floor                | Scalar/Vector | Input type           |
| `ceil(x)`                     | Ceiling              | Scalar/Vector | Input type           |
| `round(x)`                    | Round                | Scalar/Vector | Input type           |
| `fract(x)`                    | Fractional part      | Scalar/Vector | Input type           |
| `trunc(x)`                    | Truncate             | Scalar/Vector | Input type           |
| `min(x, y)`                   | Minimum              | Scalar/Vector | Higher priority type |
| `max(x, y)`                   | Maximum              | Scalar/Vector | Higher priority type |
| `clamp(x, min, max)`          | Clamp                | Scalar/Vector | Higher priority type |
| `saturate(x)`                 | Saturate (0-1)       | Scalar/Vector | Input type           |
| `mix(x, y, a)`                | Linear interpolation | Scalar/Vector | Higher priority type |
| `step(edge, x)`               | Step function        | Scalar/Vector | Higher priority type |
| `smoothstep(edge0, edge1, x)` | Smooth step          | Scalar/Vector | Higher priority type |

### Vector Functions

| Function             | Description   | Argument Type | Return Type |
| -------------------- | ------------- | ------------- | ----------- |
| `length(x)`          | Vector length | Vector        | `float`     |
| `distance(x, y)`     | Distance      | Vector        | `float`     |
| `dot(x, y)`          | Dot product   | Vector        | `float`     |
| `cross(x, y)`        | Cross product | `vec3`        | `vec3`      |
| `normalize(x)`       | Normalize     | Vector        | Input type  |
| `reflect(I, N)`      | Reflection    | Vector        | Input type  |
| `refract(I, N, eta)` | Refraction    | Vector        | Input type  |

### Derivative Functions

| Function    | Description            | Argument Type | Return Type |
| ----------- | ---------------------- | ------------- | ----------- |
| `dFdx(x)`   | X-direction derivative | Scalar/Vector | Input type  |
| `dFdy(x)`   | Y-direction derivative | Scalar/Vector | Input type  |
| `fwidth(x)` | Derivative width       | Scalar/Vector | Input type  |

### Utility Functions

| Function        | Description | Argument Type | Return Type |
| --------------- | ----------- | ------------- | ----------- |
| `oneMinus(x)`   | One minus x | Scalar/Vector | Input type  |
| `negate(x)`     | Negate      | Scalar/Vector | Input type  |
| `reciprocal(x)` | Reciprocal  | Scalar/Vector | Input type  |

## Swizzling Operations

### Vector Component Access

Vector type NodeProxies recognize swizzling operations like .xyz, .rgb, .stpq.
These operations are represented as member nodes with dimensional return types.

| Pattern | Description          | Usage Examples          |
| ------- | -------------------- | ----------------------- |
| `xyzw`  | Position coordinates | `vec.xyz`, `vec.xy`     |
| `rgba`  | Color components     | `color.rgb`, `color.rg` |
| `stpq`  | Texture coordinates  | `uv.st`, `uv.s`         |

```
Swizzling Example:
vec4(1,2,3,4) ─┬─ .xyz  ──→ vec3(1,2,3)
               ├─ .xy   ──→ vec2(1,2)
               ├─ .w    ──→ float(4)
               └─ .rgba ──→ vec4(1,2,3,4)
```

## Variable and Scope Management

### Variable Declaration System

The toVar() method converts expression nodes to variable declaration nodes.
This process generates variable IDs and adds variable declaration statements to scopes through declare type nodes.

### Factory Function Groups

| Function               | Purpose           | Generated Node | Description              |
| ---------------------- | ----------------- | -------------- | ------------------------ |
| `attribute(value, id)` | Vertex attributes | `attribute`    | Vertex data reception    |
| `uniform(value, id)`   | Uniforms          | `uniform`      | CPU-GPU data transfer    |
| `constant(value, id)`  | Constants         | `constant`     | Compile-time constants   |
| `variable(id)`         | Variables         | `variable`     | Local variables          |
| `builtin(id)`          | Builtins          | `builtin`      | Shader builtin variables |
| `varying(node, id)`    | Varyings          | `varying`      | Vertex-fragment data     |

### Scope Operations

| Method           | Description | Return Value    |
| ---------------- | ----------- | --------------- |
| `.toVar(name)`   | Variablize  | Variable node   |
| `.assign(value)` | Assignment  | Assignment node |

### Scope Hierarchy Structure

The scope system manages context using scope and define variables.
The scoped() function switches scopes to execute processing within scopes.

```
Scope Hierarchy:
Global Scope
├── Function Scope
│   ├── If Scope
│   ├── Loop Scope
│   └── Switch Scope
└── Struct Scope
```

The addToScope() function adds nodes to the current scope.
For return statements, they are added to the define variable's inferFrom property for function return type inference.

## Control Structures

### Conditional Branching

The If() function receives conditional expressions and callback functions to construct if statement node structures.
Conditional branches can be expressed by chaining ElseIf() and Else() methods.

| Control Structure              | Syntax            | Description          |
| ------------------------------ | ----------------- | -------------------- |
| `If(condition, callback)`      | if statement      | Start conditional    |
| `.ElseIf(condition, callback)` | else if statement | Additional condition |
| `.Else(callback)`              | else statement    | Default case         |

### Loop Structures

| Loop Type                   | Syntax             | Description          |
| --------------------------- | ------------------ | -------------------- |
| `Loop(count, callback)`     | for loop           | Count-based loop     |
| `Loop(condition, callback)` | while loop         | Condition-based loop |
| `Break()`                   | break statement    | Exit loop            |
| `Continue()`                | continue statement | Continue loop        |

The Loop() function defines iteration counts and iteration processing.
Within iteration processing, access to generated loop variable i is available for array access and computation.

### Switch Statements

| Control Structure        | Syntax            | Description        |
| ------------------------ | ----------------- | ------------------ |
| `Switch(value)`          | switch statement  | Multi-branch start |
| `.Case(value, callback)` | case statement    | Value-based branch |
| `.Default(callback)`     | default statement | Default case       |

### Conditional Operators

The select() function provides ternary operator functionality.
It receives conditional expressions, true values, and false values to generate conditional branch nodes.

In the children array, conditional expressions and scopes are arranged alternately, with scopes placed without conditional expressions for the Else clause.
This arrangement enables determination of conditional branch structures during code generation.

```ts
select(value if condition is false, value if condition is true, condition boolean)
// or
(value if condition is false).select(value if condition is true, condition boolean)
```

## Function Definition System

### Fn() Function Details

The Fn() function provides mechanisms for defining shader functions.
Processing defined within callback functions is constructed as function nodes with scopes.

```
Function Definition Structure:
    define_node
    /          \
 scope      layout_info
           /     |      \
       name   inputs  return_type
```

### Layout Specification

| Property | Type        | Description               |
| -------- | ----------- | ------------------------- |
| `name`   | `string`    | Function name             |
| `type`   | `Constants` | Return type               |
| `inputs` | `Array`     | Input specification array |

### Parameter Processing

Function parameters follow layout specifications when provided, or are type-inferred from arguments when not specified.
Each parameter is generated as variable nodes and becomes accessible within function scopes.

The setLayout() method enables specification of function names, return types, and argument lists.
This improves type safety and readability.

## Struct System

### Struct Definition

The struct() function provides two-stage factories for field definition and instance generation.
Field definition specifies names and types for each field, while instance generation allows setting initial values.

```
Struct Definition Flow:
struct(fields) ──→ Factory ──→ (initialValues) ──→ Instance
     ↓                              ↓
Field Specification           Initialized Struct
```

Struct definitions are topologically sorted through the dependencies system, generating header code in dependency order.

### Member Access

Struct member access is represented through member nodes.
When field names exist in the struct definition's fields property, that field's type is inferred.

## Uniforms and Attributes

### Uniform Variables

The uniform() function defines uniform variables for transferring data from CPU to GPU.
Generated NodeProxies set listeners to monitor value changes, enabling reactive updates.

| Uniform Type | JavaScript Type | GLSL Type   | WGSL Type             |
| ------------ | --------------- | ----------- | --------------------- |
| Scalar       | `number`        | `float`     | `f32`                 |
| Vector       | `number[]`      | `vec2/3/4`  | `vec2/3/4<f32>`       |
| Matrix       | `number[]`      | `mat2/3/4`  | `mat2x2/3x3/4x4<f32>` |
| Texture      | `string`        | `sampler2D` | `texture_2d<f32>`     |

Uniform variable types are inferred from initial values or specified through type conversion nodes.
Processing passes are executed for texture types.

### Attribute Variables

The attribute() function defines attribute variables for receiving vertex data.
Stride is calculated from array length and vertex count, with type inference performed.

| Attribute Type | Stride | GLSL Type | WGSL Type   |
| -------------- | ------ | --------- | ----------- |
| 1 component    | 1      | `float`   | `f32`       |
| 2 components   | 2      | `vec2`    | `vec2<f32>` |
| 3 components   | 3      | `vec3`    | `vec3<f32>` |
| 4 components   | 4      | `vec4`    | `vec4<f32>` |

### Built-in Variables

The builtin() function generates nodes for accessing built-in variables like position and normal.
These variables are values provided at each stage of the rendering pipeline.

| Built-in Variable | Description         | Type   | Available Stage |
| ----------------- | ------------------- | ------ | --------------- |
| `position`        | Vertex position     | `vec4` | Vertex/Fragment |
| `normal`          | Normal vector       | `vec3` | Fragment        |
| `uv`              | Texture coordinates | `vec2` | Fragment        |
| `color`           | Vertex color        | `vec4` | Fragment        |

## Texture Sampling

### Texture Functions

The texture() function generates function nodes representing texture sampling operations.
Sampling or mipmap level sampling is determined based on argument count.

| Function Syntax               | Description           | Return Type |
| ----------------------------- | --------------------- | ----------- |
| `texture(sampler, uv)`        | Basic sampling        | `vec4`      |
| `texture(sampler, uv, level)` | Mipmap level sampling | `vec4`      |

Texture names are assigned binding numbers through coordination with the uniform system, generating sampler references during shader code generation.

## Code Generation Rules

### Header Management

Header information like uniformHead, structHead, defineHead is managed through NodeContext.
These are sorted by dependency order after node processing and placed at the beginning of shader code.

```
Header Generation Order:
Dependencies ──→ TopologicalSort ──→ Header Order
     ↓                ↓                   ↓
 Struct Relations  Topological Sort   Dependency Order
 Function Relations    Algorithm          Headers
```

### Varying Processing

WebGPU varying (data transfer from vertex shader to fragment shader) is managed through the varying() function.
This function assigns location numbers and generates varying declarations for both shaders.

### Dependency Resolution

For struct definitions and function definitions, topological sort algorithms are used to handle cross-references and circular references.
Circular references are detected using visiting sets, generating header code in order.

```
Dependency Resolution:
Node Graph ──→ Dependency Analysis ──→ Sorted Headers
     ↓              ↓                      ↓
 Node Relations  Dependency Analysis   Sorted Headers
 Cycle Detection   Visiting Sets      Code Generation Order
```
