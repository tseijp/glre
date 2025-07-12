# Implementation Patterns

Best practices and common patterns for GLRE development.

## Shader Authoring Patterns

### Direct GLSL/WGSL Approach

```javascript
// GLSL Vertex Shader
const vertexGLSL = `
#version 300 es
in vec3 position;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
out vec3 worldPos;

void main() {
    worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
}
`

// WGSL Fragment Shader
const fragmentWGSL = `
@fragment
fn main(@location(0) worldPos: vec3f) -> @location(0) vec4f {
    let color = normalize(worldPos) * 0.5 + 0.5;
    return vec4f(color, 1.0);
}
`

const gl = createGL({
        vertex: vertexGLSL,
        fragment: fragmentWGSL,
        isWebGL: false, // WebGPU
})
```

### Node System Approach

| Pattern               | Usage                   | Example                           |
| --------------------- | ----------------------- | --------------------------------- |
| **Factory Functions** | Type-safe construction  | `vec3(1, 0, 0).mul(time)`         |
| **Method Chaining**   | Fluent operation flow   | `position.normalize().mul(scale)` |
| **Type Inference**    | Automatic type handling | `float + vec3 → vec3`             |
| **Swizzling**         | Component access        | `color.rgb`, `position.xy`        |

```javascript
// Node System Shader
const nodeFragment = () => {
        const time = uniform('time')
        const resolution = uniform('resolution')
        const position = builtin('position')

        const uv = position.xy.div(resolution)
        const wave = sin(uv.x.mul(10).add(time.mul(2)))
        const color = vec3(wave, uv.y, 0.5)

        return vec4(color, 1.0)
}

const gl = createGL({
        fragment: nodeFragment,
})
```

## Uniform Management Patterns

### Static Uniforms

```javascript
// Basic uniform setup
gl.uniform('time', 0)
gl.uniform('resolution', [800, 600])
gl.uniform('color', [1, 0.5, 0.2, 1])

// Type-specific uniforms
gl.uniform('floatValue', 3.14159) // float
gl.uniform('intValue', 42) // int
gl.uniform('boolValue', true) // bool
gl.uniform('vec2Value', [1, 2]) // vec2
gl.uniform('vec3Value', [1, 2, 3]) // vec3
gl.uniform('vec4Value', [1, 2, 3, 4]) // vec4
gl.uniform('mat3Value', [...mat3Array]) // mat3
gl.uniform('mat4Value', [...mat4Array]) // mat4
```

### Dynamic Uniforms

```javascript
// Time-based updates
gl('loop', () => {
        const time = performance.now() / 1000
        gl.uniform('iTime', time)
        gl.uniform('oscillation', Math.sin(time))
})

// Interactive updates
gl('mousemove', (event, x, y) => {
        const [width, height] = gl.size
        gl.uniform('iMouse', [x / width, 1.0 - y / height])
})

// Conditional updates using closures
const createQualityUpdater = (gl) => {
        return (quality) => {
                gl.uniform('sampleCount', quality === 'high' ? 64 : 16)
                gl.uniform('noiseOctaves', quality === 'high' ? 8 : 4)
        }
}

const updateQuality = createQualityUpdater(gl)
```

### Texture Uniforms

```javascript
// Basic texture loading
gl.texture('mainTexture', './assets/texture.jpg')
gl.texture('normalMap', './assets/normal.jpg')
gl.texture('heightMap', './assets/height.jpg')

// Texture arrays using closures
const createTextureLoader = (gl) => {
        const textures = ['tex1.jpg', 'tex2.jpg', 'tex3.jpg']

        const loadAll = () => {
                textures.forEach((path, index) => {
                        gl.texture(`texture${index}`, path)
                })
        }

        return { loadAll }
}

const textureLoader = createTextureLoader(gl)
textureLoader.loadAll()

// Cubemap handling
gl.texture('envMap', [
        './cubemap/px.jpg',
        './cubemap/nx.jpg',
        './cubemap/py.jpg',
        './cubemap/ny.jpg',
        './cubemap/pz.jpg',
        './cubemap/nz.jpg',
])
```

## Attribute Management Patterns

### Vertex Data Patterns

```javascript
// Basic vertex attributes
gl.attribute('position', [
        -1,
        -1,
        0, // vertex 0
        1,
        -1,
        0, // vertex 1
        0,
        1,
        0, // vertex 2
])

gl.attribute('color', [
        1,
        0,
        0, // red
        0,
        1,
        0, // green
        0,
        0,
        1, // blue
])

gl.attribute('uv', [
        0,
        0, // bottom-left
        1,
        0, // bottom-right
        0.5,
        1, // top-center
])
```

### Geometry Generation

| Geometry Type | Vertex Count      | Usage Pattern       |
| ------------- | ----------------- | ------------------- |
| **Triangle**  | 3                 | Basic primitive     |
| **Quad**      | 6 (2 triangles)   | Full-screen effects |
| **Cube**      | 36 (12 triangles) | 3D object base      |
| **Sphere**    | Variable          | Organic shapes      |

```javascript
// Full-screen quad generator
const createQuad = () => {
        gl.attribute('position', [-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0])
        gl.count = 6
}

// Procedural geometry using closures
const createSphereGenerator = (radius, segments) => {
        const generateVertices = () => {
                const vertices = []
                const normals = []
                const uvs = []

                for (let i = 0; i <= segments; i++) {
                        for (let j = 0; j <= segments; j++) {
                                const u = j / segments
                                const v = i / segments

                                const x = radius * Math.sin(v * Math.PI) * Math.cos(u * 2 * Math.PI)
                                const y = radius * Math.cos(v * Math.PI)
                                const z = radius * Math.sin(v * Math.PI) * Math.sin(u * 2 * Math.PI)

                                vertices.push(x, y, z)
                                normals.push(x / radius, y / radius, z / radius)
                                uvs.push(u, v)
                        }
                }

                return { vertices, normals, uvs }
        }

        const apply = (gl) => {
                const geometry = generateVertices()
                gl.attribute('position', geometry.vertices)
                gl.attribute('normal', geometry.normals)
                gl.attribute('uv', geometry.uvs)
        }

        return { generateVertices, apply }
}
```

## Animation Patterns

### Time-Based Animation

```javascript
// Basic time animation using closures
const createTimeAnimator = () => {
        let startTime = performance.now()

        const update = (gl) => {
                const time = (performance.now() - startTime) / 1000

                // Simple oscillation
                gl.uniform('oscillation', Math.sin(time))

                // Rotation animation
                gl.uniform('rotation', time * 0.5)

                // Easing function
                const eased = 0.5 * (1 + Math.sin(time * 2 - Math.PI / 2))
                gl.uniform('progress', eased)
        }

        const reset = () => {
                startTime = performance.now()
        }

        return { update, reset }
}

const animator = createTimeAnimator()
gl('loop', () => animator.update(gl))
```

### Interactive Animation

```javascript
// Mouse-following animation using closures
const createMouseFollower = () => {
        let targetMouse = [0, 0]
        let currentMouse = [0, 0]

        const handleMouseMove = (event, x, y) => {
                const [width, height] = gl.size
                targetMouse = [(x / width) * 2 - 1, -((y / height) * 2 - 1)]
        }

        const update = (gl) => {
                // Smooth interpolation
                currentMouse[0] += (targetMouse[0] - currentMouse[0]) * 0.1
                currentMouse[1] += (targetMouse[1] - currentMouse[1]) * 0.1

                gl.uniform('mousePos', currentMouse)
        }

        return { handleMouseMove, update }
}

const mouseFollower = createMouseFollower()
gl('mousemove', mouseFollower.handleMouseMove)
gl('loop', () => mouseFollower.update(gl))
```

### State Machine Animation

```javascript
// Animation state machine using closures
const createAnimationStateMachine = () => {
        const states = {
                idle: { duration: 2000, next: 'active' },
                active: { duration: 1000, next: 'cooling' },
                cooling: { duration: 500, next: 'idle' },
        }

        let currentState = 'idle'
        let stateStartTime = performance.now()

        const update = (gl) => {
                const now = performance.now()
                const elapsed = now - stateStartTime
                const state = states[currentState]

                if (elapsed >= state.duration) {
                        currentState = state.next
                        stateStartTime = now
                }

                const progress = elapsed / state.duration
                gl.uniform('animationState', currentState === 'active' ? 1 : 0)
                gl.uniform('stateProgress', progress)
        }

        const setState = (newState) => {
                if (states[newState]) {
                        currentState = newState
                        stateStartTime = performance.now()
                }
        }

        return { update, setState, getCurrentState: () => currentState }
}
```

## Error Handling Patterns

### Graceful Degradation

```javascript
// WebGPU fallback using closures
const createGLWithFallback = (config) => {
        const tryWebGPU = () => {
                if (navigator.gpu && config.preferWebGPU !== false) {
                        return createGL({ ...config, isWebGL: false })
                }
                throw new Error('WebGPU not available')
        }

        const tryWebGL = () => {
                return createGL({ ...config, isWebGL: true })
        }

        try {
                return tryWebGPU()
        } catch (error) {
                console.warn('WebGPU failed, falling back to WebGL:', error)
                return tryWebGL()
        }
}
```

### Shader Compilation Error Handling

```javascript
// Shader error handling using closures
const createShaderWithFallback = (shader, fallback) => {
        const handleError = (error) => {
                console.error('Shader compilation failed:', error)
                gl.fragment = fallback
                gl('mount') // Recompile
        }

        const gl = createGL({
                fragment: shader,
                onError: handleError,
        })

        return gl
}
```

### Resource Loading Error Handling

```javascript
// Texture loading with fallback using closures
const createTextureManager = (gl) => {
        const loadTextureWithFallback = (name, url, fallbackColor = [1, 0, 1, 1]) => {
                return gl.texture(name, url).catch((error) => {
                        console.warn(`Failed to load texture ${url}:`, error)
                        // 1x1 fallback texture
                        gl.uniform(name, fallbackColor)
                })
        }

        const loadMultiple = (textures) => {
                return Promise.allSettled(
                        Object.entries(textures).map(([name, url]) => loadTextureWithFallback(name, url))
                )
        }

        return { loadTextureWithFallback, loadMultiple }
}
```

## Platform Integration Patterns

### React Integration

```javascript
const createReactGLRE = (shader, uniforms) => {
        let gl = null
        let mounted = false

        const mount = (canvasElement) => {
                if (gl || !canvasElement) return

                gl = createGL({
                        el: canvasElement,
                        fragment: shader,
                })

                mounted = true
                updateUniforms()
        }

        const unmount = () => {
                if (gl) {
                        gl('clean')
                        gl = null
                        mounted = false
                }
        }

        const updateUniforms = () => {
                if (gl && uniforms) {
                        Object.entries(uniforms).forEach(([key, value]) => {
                                gl.uniform(key, value)
                        })
                }
        }

        // React hook pattern
        const useGLRE = () => {
                const [canvasRef, setCanvasRef] = useState(null)

                useEffect(() => {
                        if (canvasRef) mount(canvasRef)
                        return unmount
                }, [canvasRef])

                useEffect(updateUniforms, [uniforms])

                return setCanvasRef
        }

        return { mount, unmount, updateUniforms, useGLRE }
}
```

### React Native Integration

```javascript
// React Native WebGL integration using closures
const createReactNativeGLRE = (fragment) => {
        let gl = null

        const handleContextCreate = (context) => {
                gl = createGL({
                        context,
                        isNative: true,
                        fragment,
                })

                // React Native specific setup
                gl.isLoop = true
        }

        const updateUniform = (name, value) => {
                if (gl) {
                        gl.uniform(name, value)
                }
        }

        return { handleContextCreate, updateUniform }
}
```

## Closure-Based Architecture

### State Management

```javascript
// Closure-based state manager
const createStateManager = (initialState) => {
        let state = { ...initialState }
        const listeners = []

        const setState = (updates) => {
                const prevState = { ...state }
                state = { ...state, ...updates }

                listeners.forEach((listener) => listener(state, prevState))
        }

        const getState = () => ({ ...state })

        const subscribe = (listener) => {
                listeners.push(listener)
                return () => {
                        const index = listeners.indexOf(listener)
                        if (index !== -1) listeners.splice(index, 1)
                }
        }

        return { setState, getState, subscribe }
}

// Usage with GLRE
const appState = createStateManager({
        mode: 'normal',
        intensity: 1.0,
        color: [1, 1, 1],
})

appState.subscribe((state) => {
        gl.uniform('mode', state.mode === 'normal' ? 0 : 1)
        gl.uniform('intensity', state.intensity)
        gl.uniform('baseColor', state.color)
})
```

### Resource Management

```javascript
// Closure-based resource manager
const createResourceManager = () => {
        const resources = new Map()

        const register = (name, resource, cleanup) => {
                resources.set(name, { resource, cleanup })
                return resource
        }

        const get = (name) => {
                const entry = resources.get(name)
                return entry ? entry.resource : null
        }

        const release = (name) => {
                const entry = resources.get(name)
                if (entry) {
                        entry.cleanup(entry.resource)
                        resources.delete(name)
                }
        }

        const releaseAll = () => {
                resources.forEach(({ resource, cleanup }) => cleanup(resource))
                resources.clear()
        }

        return { register, get, release, releaseAll }
}
```

These patterns provide a foundation for building robust, maintainable GLRE applications using functional programming principles and closure-based architecture.
