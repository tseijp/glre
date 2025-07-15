# Troubleshooting Guide

Common problems and solutions for GLRE development.

## Shader Compilation Errors

### GLSL Compilation Errors

| Error Type              | Symptom                                | Solution                                       |
| ----------------------- | -------------------------------------- | ---------------------------------------------- |
| **Type Mismatch**       | `Cannot convert from 'int' to 'float'` | Add explicit type conversion `float(intValue)` |
| **Undefined Variable**  | `Undeclared identifier 'varName'`      | Check uniform/attribute declarations           |
| **Syntax Error**        | `Syntax error at line X`               | Check semicolons and bracket matching          |
| **Precision Qualifier** | `No precision specified`               | Add `precision mediump float;`                 |

```javascript
// Bad: Type errors
const badShader = `
#version 300 es
in vec3 position;
uniform time; // Type not specified
void main() {
    gl_Position = vec4(position + time, 1.0); // Type mismatch
}
`

// Good: Proper types
const goodShader = `
#version 300 es
precision mediump float;
in vec3 position;
uniform float time;
void main() {
    gl_Position = vec4(position + vec3(time), 1.0);
}
`
```

### WGSL Compilation Errors

| Error Type            | Symptom                    | Solution                              |
| --------------------- | -------------------------- | ------------------------------------- |
| **Binding Collision** | `Binding X already used`   | Check group/binding number duplicates |
| **Workgroup Size**    | `Invalid workgroup size`   | Verify `@workgroup_size(8, 8)` limits |
| **Stage Attribute**   | `Missing stage attribute`  | Add `@vertex`, `@fragment`            |
| **Type Annotation**   | `Type annotation required` | Explicit type `var x: f32`            |

```javascript
// WGSL error fix example
const fixedWGSL = `
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var textureSampler: sampler;
@group(0) @binding(2) var colorTexture: texture_2d<f32>;

@fragment
fn main(@location(0) uv: vec2f) -> @location(0) vec4f {
    return textureSample(colorTexture, textureSampler, uv);
}
`
```

## Node System Issues

### Type Inference Errors

```javascript
// Problem: Cannot infer type
const problematic = someValue.add(unknownType)

// Solution: Explicit type conversion
const fixed = someValue.add(unknownType.toFloat())

// Or type-safe helper using closures
const createSafeAdder = () => {
        return (a, b) => {
                const aTyped = a.type ? a : float(a)
                const bTyped = b.type ? b : float(b)
                return aTyped.add(bTyped)
        }
}

const safeAdd = createSafeAdder()
```

### Scope Errors

```javascript
// Problem: Out-of-scope variable reference
let outsideVar
If(condition, () => {
        outsideVar = vec3(1, 0, 0) // Error: Assignment outside scope
})

// Solution: Proper scope management
const result = If(condition, () => {
        return vec3(1, 0, 0)
}).Else(() => {
        return vec3(0, 0, 1)
})
```

### Method Chain Errors

```javascript
// Problem: Undefined method call
const invalid = position.invalidMethod().mul(2)

// Solution: Check valid methods
const valid = position.normalize().mul(2)

// Debug method existence using closures
const createMethodChecker = () => {
        return (node, methodName) => {
                if (typeof node[methodName] !== 'function') {
                        console.error(`Method ${methodName} not available on`, node)
                        return node
                }
                return node[methodName]()
        }
}

const debugChain = createMethodChecker()
```

## Platform-Specific Issues

### WebGL Problems

#### Extension Support

```javascript
// WebGL extension checking using closures
const createWebGLChecker = () => {
        const checkExtensions = (gl) => {
                const required = ['OES_texture_float', 'WEBGL_depth_texture', 'EXT_color_buffer_float']

                const missing = required.filter((ext) => !gl.getExtension(ext))

                if (missing.length > 0) {
                        console.warn('Missing WebGL extensions:', missing)
                        return false
                }

                return true
        }

        return { checkExtensions }
}

// Fallback implementation using closures
const createGLWithFallback = (config) => {
        const tryCreate = () => {
                try {
                        return createGL(config)
                } catch (error) {
                        console.warn('WebGL creation failed:', error)
                        // More compatible settings
                        return createGL({
                                ...config,
                                antialias: false,
                                alpha: false,
                        })
                }
        }

        return tryCreate()
}
```

#### Context Loss Handling

```javascript
// WebGL context loss management using closures
const createContextLossHandler = (canvas, gl) => {
        let isContextLost = false

        const handleContextLost = (event) => {
                event.preventDefault()
                console.warn('WebGL context lost')
                isContextLost = true
                gl.isLoop = false
        }

        const handleContextRestored = () => {
                console.log('WebGL context restored')
                isContextLost = false
                gl('mount') // Reinitialize
                gl.isLoop = true
        }

        canvas.addEventListener('webglcontextlost', handleContextLost)
        canvas.addEventListener('webglcontextrestored', handleContextRestored)

        return { isContextLost: () => isContextLost }
}
```

### WebGPU Problems

#### Adapter Request Failure

```javascript
// WebGPU adapter diagnostics using closures
const createWebGPUDiagnostics = () => {
        const diagnose = async () => {
                if (!navigator.gpu) {
                        return 'WebGPU not supported in this browser'
                }

                try {
                        const adapter = await navigator.gpu.requestAdapter()
                        if (!adapter) {
                                return 'No suitable WebGPU adapter found'
                        }

                        const device = await adapter.requestDevice()
                        return 'WebGPU available'
                } catch (error) {
                        return `WebGPU error: ${error.message}`
                }
        }

        return { diagnose }
}

// Usage
const diagnostics = createWebGPUDiagnostics()
diagnostics.diagnose().then((result) => {
        console.log('WebGPU status:', result)
})
```

#### Device Limit Checking

```javascript
// WebGPU device limits verification using closures
const createLimitChecker = () => {
        const checkLimits = (device) => {
                const limits = device.limits

                console.log('WebGPU Limits:', {
                        maxTextureDimension2D: limits.maxTextureDimension2D,
                        maxBindGroups: limits.maxBindGroups,
                        maxUniformBufferBindingSize: limits.maxUniformBufferBindingSize,
                        maxStorageBufferBindingSize: limits.maxStorageBufferBindingSize,
                })

                // Limit validation
                const warnings = []
                if (limits.maxTextureDimension2D < 4096) {
                        warnings.push('Large textures may not be supported')
                }

                return warnings
        }

        return { checkLimits }
}
```

## Memory and Resource Issues

### Memory Leak Detection

```javascript
// WebGL resource tracking using closures
const createResourceTracker = () => {
        const resources = {
                textures: new Set(),
                buffers: new Set(),
                programs: new Set(),
        }

        const trackGL = (gl) => {
                // Override texture creation
                const originalCreateTexture = gl.createTexture
                gl.createTexture = function () {
                        const texture = originalCreateTexture.call(this)
                        resources.textures.add(texture)
                        return texture
                }

                // Override texture deletion
                const originalDeleteTexture = gl.deleteTexture
                gl.deleteTexture = function (texture) {
                        resources.textures.delete(texture)
                        return originalDeleteTexture.call(this, texture)
                }
        }

        const getResourceCount = () => ({
                textures: resources.textures.size,
                buffers: resources.buffers.size,
                programs: resources.programs.size,
        })

        return { trackGL, getResourceCount }
}
```

### Garbage Collection Issues

```javascript
// Object pool pattern using closures
const createObjectPool = (createFn, resetFn, initialSize = 10) => {
        const pool = []
        const active = []

        // Initialize pool
        for (let i = 0; i < initialSize; i++) {
                pool.push(createFn())
        }

        const acquire = () => {
                let obj
                if (pool.length > 0) {
                        obj = pool.pop()
                } else {
                        obj = createFn()
                }

                active.push(obj)
                return obj
        }

        const release = (obj) => {
                const index = active.indexOf(obj)
                if (index !== -1) {
                        active.splice(index, 1)
                        resetFn(obj)
                        pool.push(obj)
                }
        }

        const stats = () => ({
                pooled: pool.length,
                active: active.length,
        })

        return { acquire, release, stats }
}

// vec3 pool example
const vec3Pool = createObjectPool(
        () => ({ x: 0, y: 0, z: 0 }),
        (v) => {
                v.x = v.y = v.z = 0
        }
)
```

## Debug Techniques

### Visual Debugging

```javascript
// Color-coded debugging using closures
const createVisualDebugger = () => {
        const debugColors = {
                red: vec3(1, 0, 0),
                green: vec3(0, 1, 0),
                blue: vec3(0, 0, 1),
                yellow: vec3(1, 1, 0),
                magenta: vec3(1, 0, 1),
                cyan: vec3(0, 1, 1),
        }

        const visualDebug = Fn(([value, mode]) => {
                return Switch(mode)
                        .Case(0, () => debugColors.red) // Error
                        .Case(1, () => debugColors.green) // Normal
                        .Case(2, () => debugColors.blue) // Info
                        .Case(3, () => value.xxx) // X component only
                        .Case(4, () => value.yyy) // Y component only
                        .Case(5, () => value.zzz) // Z component only
                        .Default(() => debugColors.magenta) // Undefined
        })

        return { visualDebug, debugColors }
}
```

### Step-Through Debugging

```javascript
// Shader step-through debugging using closures
const createStepDebugger = () => {
        const debugStep = (condition, value, debugValue) => {
                return select(condition, debugValue, value)
        }

        const createSteppedShader = () => {
                return () => {
                        const normalColor = calculateLighting()
                        const debugMode = uniform('debugMode')

                        // Debug steps
                        const step1 = debugStep(debugMode.equal(1), normalColor, vec3(1, 0, 0))
                        const step2 = debugStep(debugMode.equal(2), step1, vec3(0, 1, 0))

                        return vec4(step2, 1.0)
                }
        }

        return { debugStep, createSteppedShader }
}
```

### Value Logging

```javascript
// Shader value CPU logging using closures
const createValueLogger = (gl) => {
        const logShaderValue = (name, value) => {
                // Feedback buffer for WebGPU
                if (gl.isWebGPU) {
                        gl.feedback(name, value, (result) => {
                                console.log(`${name}:`, result)
                        })
                } else {
                        // WebGL: texture readback
                        gl.readPixel(name, value, (result) => {
                                console.log(`${name}:`, result)
                        })
                }
        }

        return { logShaderValue }
}
```

## Environment-Specific Issues

### Browser Compatibility

```javascript
// Browser capability detection using closures
const createCapabilityDetector = () => {
        const detectCapabilities = () => {
                const capabilities = {
                        webgl2: !!document.createElement('canvas').getContext('webgl2'),
                        webgpu: !!navigator.gpu,
                        sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
                        offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
                }

                console.log('Browser capabilities:', capabilities)
                return capabilities
        }

        const createOptimalConfig = (capabilities) => ({
                isWebGL: !capabilities.webgpu,
                useOffscreenCanvas: capabilities.offscreenCanvas,
                enableSharedBuffers: capabilities.sharedArrayBuffer,
        })

        return { detectCapabilities, createOptimalConfig }
}
```

### Mobile Optimizations

```javascript
// Mobile device limitations using closures
const createMobileOptimizer = () => {
        const getMaxTextureSize = () => {
                const canvas = document.createElement('canvas')
                const gl = canvas.getContext('webgl2')
                return gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 1024
        }

        const checkPrecision = (gl) => {
                const vertexPrecision = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT)
                const fragmentPrecision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)

                return {
                        vertex: vertexPrecision.precision > 0,
                        fragment: fragmentPrecision.precision > 0,
                }
        }

        const estimateMemoryUsage = (width, height, format) => {
                const bytesPerPixel = {
                        rgba8: 4,
                        rgba16f: 8,
                        rgba32f: 16,
                }

                return width * height * (bytesPerPixel[format] || 4)
        }

        return { getMaxTextureSize, checkPrecision, estimateMemoryUsage }
}
```

## Error Recovery Patterns

### Graceful Degradation

```javascript
// Error recovery system using closures
const createErrorRecovery = () => {
        const createWithRecovery = (primaryConfig, fallbackConfig) => {
                try {
                        return createGL(primaryConfig)
                } catch (primaryError) {
                        console.warn('Primary configuration failed:', primaryError)

                        try {
                                return createGL(fallbackConfig)
                        } catch (fallbackError) {
                                console.error('Fallback configuration failed:', fallbackError)
                                throw new Error('Unable to initialize graphics context')
                        }
                }
        }

        return { createWithRecovery }
}
```

### Automatic Retry Logic

```javascript
// Retry mechanism using closures
const createRetryHandler = () => {
        const withRetry = async (operation, maxAttempts = 3, delay = 1000) => {
                for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                        try {
                                return await operation()
                        } catch (error) {
                                if (attempt === maxAttempts) {
                                        throw error
                                }

                                console.warn(`Attempt ${attempt} failed, retrying...`, error)
                                await new Promise((resolve) => setTimeout(resolve, delay))
                        }
                }
        }

        return { withRetry }
}
```

## Troubleshooting Checklist

### Basic Checks

- [ ] WebGL2/WebGPU support verification
- [ ] Required extension availability
- [ ] Shader compilation error checking
- [ ] Uniform/Attribute name matching
- [ ] Texture format and size limits
- [ ] Device memory usage
- [ ] Browser console errors

### Common Solutions

| Problem              | Likely Cause               | Solution              |
| -------------------- | -------------------------- | --------------------- |
| Black screen         | Shader compilation error   | Check browser console |
| Performance issues   | Too many draw calls        | Implement batching    |
| Memory leaks         | Unreleased resources       | Add cleanup methods   |
| Mobile compatibility | Precision/extension issues | Use fallback shaders  |

GLRE's troubleshooting approach emphasizes systematic debugging and graceful degradation to maintain application stability across different environments.
