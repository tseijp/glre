# GLRE API Documentation

Complete technical reference for the GLRE Reactive GPU Engine.

## Overview

GLRE is a TypeScript library that bridges CPU-side JavaScript with GPU-side shader programming.
It provides automatic configuration for data transmission between CPU and GPU, supporting both WebGL2 and WebGPU platforms.

## Architecture

```
JavaScript/TypeScript Code
         │
    ┌────▼────┐
    │  GLRE   │ ──── Automatic binding
    │ Engine  │      Resource management
    └────┬────┘      Event syscd etem
         │
    GPU Execution
```

### Core Components

| Component                              | Purpose               | Key Features                                    |
| -------------------------------------- | --------------------- | ----------------------------------------------- |
| **[Core Engine](core/01-engine.md)**   | GPU abstraction layer | WebGL2/WebGPU support, automatic initialization |
| **[Event System](core/02-events.md)**  | Reactive programming  | Mount/cleanup, mouse/keyboard, animation loops  |
| **[Configuration](core/03-config.md)** | Engine settings       | Platform detection, quality settings            |

### Node System

| Component                                      | Purpose                     | Key Features                      |
| ---------------------------------------------- | --------------------------- | --------------------------------- |
| **[TSL Overview](node/04-overview.md)**        | TypeScript Shading Language | React-like syntax, type inference |
| **[Type Systems](node/05-systems.md)**         | Shader types in TypeScript  | Automatic conversion, swizzling   |
| **[Function Reference](node/06-functions.md)** | Complete function library   | 150+ mathematical functions       |

### Reference

| Component                        | Purpose          | Key Features                          |
| -------------------------------- | ---------------- | ------------------------------------- |
| **[Implementation Patterns](#)** | Code patterns    | Best practices, common solutions      |
| **[Advanced Techniques](#)**     | Complex features | Multi-pass rendering, compute shaders |
| **[Troubleshooting](#)**         | Problem solving  | Error handling, debugging             |

## Quick Start

### Basic Setup

```javascript
import { createGL, vec4 } from 'glre'

const gl = createGL({
        fragment: () => {
                return vec4(1.0, 0.5, 0.2, 1.0) // Orange color
        },
})
```

### With Animation

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const color = sin(time).mul(0.5).add(0.5)
                return vec4(color, color, color, 1.0)
        },
})

gl('loop', () => {
        gl.uniform('iTime', performance.now() / 1000)
})
```

## API Categories

### Factory Functions

| Function     | Purpose               | Example                                 |
| ------------ | --------------------- | --------------------------------------- |
| `createGL()` | Engine initialization | `createGL({ width: 800, height: 600 })` |
| `vec3()`     | 3D vector creation    | `vec3(1, 0, 0)`                         |
| `uniform()`  | CPU-GPU data binding  | `uniform('time')`                       |

### Mathematical Operations

| Category          | Functions                                   | Count |
| ----------------- | ------------------------------------------- | ----- |
| **Trigonometric** | `sin`, `cos`, `tan`, `asin`, `acos`, `atan` | 7     |
| **Exponential**   | `pow`, `sqrt`, `exp`, `log`                 | 10    |
| **Common Math**   | `abs`, `floor`, `ceil`, `min`, `max`        | 15+   |
| **Vector**        | `length`, `normalize`, `dot`, `cross`       | 8     |

### Control Structures

| Structure       | Syntax                     | Purpose          |
| --------------- | -------------------------- | ---------------- |
| **Conditional** | `If().ElseIf().Else()`     | Branching logic  |
| **Loops**       | `Loop(count, callback)`    | Iteration        |
| **Functions**   | `Fn(callback).setLayout()` | Custom functions |

## Platform Support

### WebGL2 Features

- OpenGL ES 3.0 compatibility
- Automatic extension detection
- Fallback handling

### WebGPU Features

- Modern graphics API
- Compute shader support
- Advanced pipeline management

## Type System

### Basic Types

| Type    | Size    | Description           |
| ------- | ------- | --------------------- |
| `float` | 32-bit  | Floating point number |
| `int`   | 32-bit  | Integer number        |
| `bool`  | 1-bit   | Boolean value         |
| `vec2`  | 64-bit  | 2D vector             |
| `vec3`  | 96-bit  | 3D vector             |
| `vec4`  | 128-bit | 4D vector             |

### Advanced Types

| Type        | Purpose           | Usage           |
| ----------- | ----------------- | --------------- |
| `mat2/3/4`  | Matrix operations | Transformations |
| `texture2D` | Image sampling    | Texture access  |
| `struct`    | Custom data types | Complex objects |

## Next Steps

- Explore [Core Engine](core/01-engine.md) for initialization
- Learn [Node System](node/04-overview.md) for shader authoring
- Reference [Functions](node/06-functions.md) for available operations

TSL provides a complete toolkit for GPU programming in TypeScript, making complex graphics accessible through familiar syntax.
