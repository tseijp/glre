# Core Engine

The GLRE core engine provides GPU abstraction and automatic resource management.

## Engine Initialization

### Basic Creation

```javascript
import { createGL } from 'glre'

// Minimal setup
const gl = createGL()

// With options
const gl = createGL({
        width: 800,
        height: 600,
        isWebGL: true,
})
```

### Configuration Options

| Option    | Type      | Default              | Description                  |
| --------- | --------- | -------------------- | ---------------------------- |
| `width`   | `number`  | `window.innerWidth`  | Canvas width                 |
| `height`  | `number`  | `window.innerHeight` | Canvas height                |
| `isWebGL` | `boolean` | `true`               | Use WebGL2 instead of WebGPU |
| `isLoop`  | `boolean` | `true`               | Enable animation loop        |
| `count`   | `number`  | `6`                  | Number of vertices to draw   |

## Platform Detection

The engine automatically selects the best available graphics API:

```javascript
const createOptimalGL = () => {
        if (forceLegacy) {
                return createGL({ isWebGL: false }) // WebGPU
        }
        return createGL({ isWebGL: true }) // WebGL2
}
```

### Platform Capabilities

| Platform   | Features                              | Compatibility          |
| ---------- | ------------------------------------- | ---------------------- |
| **WebGPU** | Compute shaders, advanced pipelines   | Chrome 113+, Edge 113+ |
| **WebGL2** | Fragment/vertex shaders, wide support | All modern browsers    |

## Resource Management

### Automatic Binding

TSL automatically manages GPU resources:

```javascript
const gl = createGL({
        fragment: Scope(() => {
                // Automatic type inference
                const color = sin(iTime).mul(0.5).add(0.5)
                return vec4(color, 0.5, 1.0, 1.0)
        }),
})
```

## Shader Compilation

### Automatic Generation

TSL converts TypeScript to shader code:

```javascript
// TypeScript Node System
const nodeShader = Scope(() => {
        const uv = position.xy.mul(0.5).add(0.5)
        const pattern = sin(uv.x.mul(10)).mul(sin(uv.y.mul(10)))
        return vec4(pattern, pattern, pattern, 1.0)
})

// Compiles to GLSL/WGSL automatically
const gl = createGL({
        fragment: nodeShader,
})
```

### Manual Shader Code

You can also provide raw shader strings:

```javascript
const gl = createGL({
        vertex: `
        #version 300 es
        in vec3 position;
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
        fragment: `
        #version 300 es
        precision mediump float;
        out vec4 fragColor;
        void main() {
            fragColor = vec4(1.0, 0.5, 0.2, 1.0);
        }
    `,
})
```

## Uniform System

### Type-Safe Uniforms

```javascript
const setupUniforms = (gl) => {
        const uniformCache = new Map()

        const setUniform = (name, value) => {
                // Automatic type detection
                if (typeof value === 'number') {
                        gl.uniform1f(name, value)
                } else if (Array.isArray(value)) {
                        switch (value.length) {
                                case 2:
                                        gl.uniform2f(name, ...value)
                                        break
                                case 3:
                                        gl.uniform3f(name, ...value)
                                        break
                                case 4:
                                        gl.uniform4f(name, ...value)
                                        break
                                case 16:
                                        gl.uniformMatrix4fv(name, false, value)
                                        break
                        }
                }

                uniformCache.set(name, value)
        }

        const getUniform = (name) => uniformCache.get(name)

        return { setUniform, getUniform }
}
```

## Attribute Management

### Vertex Data Handling

```javascript
const createAttributeManager = (gl) => {
        const attributes = new Map()

        const setAttribute = (name, data, options = {}) => {
                const buffer = gl.createBuffer()
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)

                const location = gl.getAttribLocation(program, name)
                if (location !== -1) {
                        gl.enableVertexAttribArray(location)
                        gl.vertexAttribPointer(location, options.size ?? 3, gl.FLOAT, false, options.stride ?? 0, options.offset ?? 0)

                        if (options.divisor !== undefined) {
                                gl.vertexAttribDivisor(location, options.divisor)
                        }
                }

                attributes.set(name, { buffer, location, data })
        }

        const cleanup = () => {
                attributes.forEach(({ buffer }) => {
                        gl.deleteBuffer(buffer)
                })
                attributes.clear()
        }

        return { setAttribute, cleanup }
}
```

## Texture Loading

### Automatic Texture Management

```javascript
const createTextureManager = (gl) => {
        const textures = new Map()

        const loadTexture = async (name, source) => {
                const texture = gl.createTexture()
                gl.bindTexture(gl.TEXTURE_2D, texture)

                // Placeholder 1x1 pixel
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]))

                if (typeof source === 'string') {
                        const image = new Image()

                        return new Promise((resolve, reject) => {
                                image.onload = () => {
                                        gl.bindTexture(gl.TEXTURE_2D, texture)
                                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
                                        gl.generateMipmap(gl.TEXTURE_2D)

                                        textures.set(name, texture)
                                        resolve(texture)
                                }
                                image.onerror = reject
                                image.src = source
                        })
                }

                textures.set(name, texture)
                return texture
        }

        const getTexture = (name) => textures.get(name)

        const cleanup = () => {
                textures.forEach((texture) => gl.deleteTexture(texture))
                textures.clear()
        }

        return { loadTexture, getTexture, cleanup }
}
```

## Error Handling

### Graceful Degradation

```javascript
const createGLWithFallback = (config) => {
        try {
                // Try WebGPU first
                if (!config.forceWebGL && navigator.gpu) {
                        return createGL({ ...config, isWebGL: false })
                }
        } catch (error) {
                console.warn('WebGPU failed, falling back to WebGL:', error)
        }

        try {
                // Fallback to WebGL2
                return createGL({ ...config, isWebGL: true })
        } catch (error) {
                console.error('Both WebGPU and WebGL2 failed:', error)
                throw new Error('No compatible graphics API found')
        }
}
```

### Context Loss Handling

```javascript
const handleContextEvents = (canvas, gl, onRestore) => {
        canvas.addEventListener('webglcontextlost', (event) => {
                event.preventDefault()
                console.warn('WebGL context lost')
        })

        canvas.addEventListener('webglcontextrestored', () => {
                console.log('WebGL context restored')
                onRestore()
        })
}
```

## Render Loop

### Animation Management

```javascript
const createRenderLoop = (gl) => {
        let isRunning = false
        let frameId = null

        const start = () => {
                if (isRunning) return
                isRunning = true

                const frame = () => {
                        if (!isRunning) return

                        gl.render()
                        frameId = requestAnimationFrame(frame)
                }

                frame()
        }

        const stop = () => {
                isRunning = false
                if (frameId) {
                        cancelAnimationFrame(frameId)
                        frameId = null
                }
        }

        return { start, stop }
}
```

The TSL core engine handles all low-level GPU operations automatically, letting you focus on creative coding rather than graphics API complexity.
