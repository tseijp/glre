# Instancing Examples

GLRE instancing allows you to render multiple instances of the same geometry efficiently with a single draw call.

## Features

- **WebGL2 Support**: Uses `drawArraysInstanced` for efficient rendering
- **WebGPU Support**: Native instancing with optimized draw commands
- **Instance Attributes**: Per-instance position, color, transformation data
- **Performance**: Dramatically reduces draw calls for large object counts

## Examples

- [WebGL Instancing](/instance/webgl/squares) - 100 colored squares using WebGL2 instancing
- [WebGPU Instancing](/instance/webgpu/squares) - 100 colored squares using WebGPU instancing

## Usage

```typescript
import { useGL } from 'glre/react'
import { vec4, attribute } from 'glre/node'

const instancePositions = [
        /* position data */
]
const instanceColors = [
        /* color data */
]

const gl = useGL({
        instance: 100, // Number of instances
        vert: vec4(basePosition.add(instancePosition), 1),
        frag: instanceColor,
})

gl.attribute('instancePosition', instancePositions)
gl.attribute('instanceColor', instanceColors)
```
