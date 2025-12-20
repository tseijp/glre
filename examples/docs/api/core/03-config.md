# Configuration

GLRE configuration system for customizing engine behavior and platform settings.

## Basic Configuration

### Core Settings

| Option     | Type      | Default              | Description                     |
| ---------- | --------- | -------------------- | ------------------------------- |
| `isWebGL`  | `boolean` | `true`               | Choose WebGL2 over WebGPU       |
| `isLoop`   | `boolean` | `true`               | Enable automatic animation loop |
| `isNative` | `boolean` | `false`              | React Native environment flag   |
| `count`    | `number`  | `6`                  | Number of primitives to draw    |
| `width`    | `number`  | `window.innerWidth`  | Canvas width                    |
| `height`   | `number`  | `window.innerHeight` | Canvas height                   |

### Shader Configuration

| Option     | Type           | Default         | Description          |
| ---------- | -------------- | --------------- | -------------------- |
| `vertex`   | `string\|Node` | defaultVertex   | Vertex shader code   |
| `fragment` | `string\|Node` | defaultFragment | Fragment shader code |
| `vs`       | `string\|Node` | -               | Alias for vertex     |
| `fs`       | `string\|Node` | -               | Alias for fragment   |

## Configuration Examples

### Minimal Setup

```javascript
// Default configuration
const gl = createGL()

// Basic configuration
const gl = createGL({
        width: 800,
        height: 600,
        isWebGL: true,
})
```

### Custom Shaders

```javascript
// Node system shader
const gl = createGL({
        fragment: Scope(() => {
                const color = sin(iTime).mul(0.5).add(0.5)
                return vec4(color, color, color, 1.0)
        }),
})

// Raw shader strings
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

## Platform Detection

### Automatic Selection

```javascript
const createOptimalGL = (userConfig = {}) => {
        const config = {
                ...getDefaultConfig(),
                ...getPlatformConfig(),
                ...userConfig,
        }

        return createGL(config)
}

const getDefaultConfig = () => ({
        width: 800,
        height: 600,
        isLoop: true,
        count: 6,
})

const getPlatformConfig = () => {
        if (typeof navigator === 'undefined') {
                // Node.js environment
                return { isWebGL: true }
        }

        if (navigator.gpu) {
                // WebGPU available
                return { isWebGL: false }
        }

        // Fallback to WebGL2
        return { isWebGL: true }
}
```

### Environment Detection

```javascript
const detectEnvironment = () => {
        const env = {
                isNode: typeof window === 'undefined',
                isBrowser: typeof window !== 'undefined',
                isReactNative: typeof navigator !== 'undefined' && navigator.product === 'ReactNative',
                hasWebGPU: typeof navigator !== 'undefined' && !!navigator.gpu,
                hasWebGL2: typeof WebGL2RenderingContext !== 'undefined',
        }

        return env
}

const createEnvironmentConfig = () => {
        const env = detectEnvironment()

        if (env.isReactNative) {
                return {
                        isNative: true,
                        isWebGL: true, // React Native requires WebGL
                        antialias: false, // Better performance
                }
        }

        if (env.hasWebGPU) {
                return {
                        isWebGL: false,
                        powerPreference: 'high-performance',
                }
        }

        return {
                isWebGL: true,
                antialias: true,
        }
}
```

## Runtime Configuration

### Dynamic Updates

```javascript
const createConfigurableGL = (initialConfig) => {
        let currentConfig = { ...initialConfig }
        const gl = createGL(currentConfig)

        const updateConfig = (updates) => {
                const prevConfig = { ...currentConfig }
                currentConfig = { ...currentConfig, ...updates }

                // Handle specific config changes
                if (updates.width || updates.height) {
                        gl.canvas.width = currentConfig.width
                        gl.canvas.height = currentConfig.height
                        gl('resize')
                }

                if (updates.fragment || updates.vertex) {
                        // Recompile shaders
                        gl('mount')
                }

                return { prevConfig, currentConfig }
        }

        return { gl, updateConfig, getConfig: () => ({ ...currentConfig }) }
}
```

### Conditional Configuration

```javascript
const createAdaptiveConfig = () => {
        const baseConfig = {
                width: window.innerWidth,
                height: window.innerHeight,
        }

        // Performance-based adjustments
        const getPerformanceConfig = () => {
                const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                const isLowEnd = navigator.hardwareConcurrency <= 2

                return {
                        antialias: !isMobile,
                        count: isLowEnd ? 3 : 6,
                        isWebGL: isMobile || isLowEnd,
                }
        }

        return {
                ...baseConfig,
                ...getPerformanceConfig(),
        }
}
```

## Default Configurations

### Default Shaders

```javascript
const createDefaultShaders = () => {
        const defaultVertex = () => {
                const vertexIndex = builtin('vertexIndex')

                // Generate full-screen triangle
                const x = float(int(vertexIndex).mod(2)).mul(4).sub(1)
                const y = float(int(vertexIndex).div(2)).mul(4).sub(1)

                return vec4(x, y, 0, 1)
        }

        const defaultFragment = () => {
                const uv = position.xy.div(iResolution)
                return vec4(uv, 0, 1)
        }

        return { defaultVertex, defaultFragment }
}
```

### Platform Defaults

```javascript
const createPlatformDefaults = () => {
        const webglDefaults = {
                isWebGL: true,
                webgl: {
                        antialias: true,
                        alpha: false,
                        depth: true,
                        stencil: false,
                        premultipliedAlpha: false,
                        preserveDrawingBuffer: false,
                },
        }

        const webgpuDefaults = {
                isWebGL: false,
                webgpu: {
                        powerPreference: 'default',
                        forceFallbackAdapter: false,
                },
        }

        return { webglDefaults, webgpuDefaults }
}
```

## Configuration Validation

### Input Validation

```javascript
const validateConfig = (config) => {
        const errors = []
        const warnings = []

        // Required validations
        if (config.width <= 0) {
                errors.push('Width must be positive')
        }

        if (config.height <= 0) {
                errors.push('Height must be positive')
        }

        // Warning validations
        if (config.width > 4096 || config.height > 4096) {
                warnings.push('Large canvas size may impact performance')
        }

        if (config.isWebGL === false && !navigator.gpu) {
                warnings.push('WebGPU not available, will fallback to WebGL2')
        }

        return { errors, warnings, isValid: errors.length === 0 }
}

const createValidatedGL = (userConfig) => {
        const validation = validateConfig(userConfig)

        if (!validation.isValid) {
                throw new Error(`Configuration errors: ${validation.errors.join(', ')}`)
        }

        if (validation.warnings.length > 0) {
                console.warn('Configuration warnings:', validation.warnings)
        }

        return createGL(userConfig)
}
```

## Configuration Merging

### Merge Strategy

```javascript
const mergeConfigurations = (...configs) => {
        const merged = {}

        configs.forEach((config) => {
                Object.keys(config).forEach((key) => {
                        if (typeof config[key] === 'object' && !Array.isArray(config[key])) {
                                // Deep merge objects
                                merged[key] = { ...merged[key], ...config[key] }
                        } else {
                                // Override primitives and arrays
                                merged[key] = config[key]
                        }
                })
        })

        return merged
}

const createConfiguredGL = (userConfig) => {
        const { webglDefaults, webgpuDefaults } = createPlatformDefaults()
        const globalDefaults = getGlobalDefaults()

        const platformDefaults = userConfig.isWebGL ? webglDefaults : webgpuDefaults

        const finalConfig = mergeConfigurations(globalDefaults, platformDefaults, userConfig)

        return createGL(finalConfig)
}
```

### Global Defaults

```javascript
const getGlobalDefaults = () => ({
        width: typeof window !== 'undefined' ? window.innerWidth : 800,
        height: typeof window !== 'undefined' ? window.innerHeight : 600,
        isWebGL: true,
        isLoop: true,
        isNative: false,
        count: 6,
})
```

## Framework Integration

### React Integration

```javascript
const createReactConfig = (props) => ({
        width: props.width || 800,
        height: props.height || 600,
        el: props.canvasRef?.current,
        fragment: props.shader,
        ...props.config,
})
```

### React Native Integration

```javascript
const createReactNativeConfig = (props) => ({
        isNative: true,
        isWebGL: true, // Required for React Native
        width: props.style?.width || 300,
        height: props.style?.height || 200,
        ...props.config,
})
```

## Configuration Best Practices

### Development vs Production

```javascript
const createEnvironmentConfig = (isDevelopment) => {
        const baseConfig = {
                width: 800,
                height: 600,
        }

        if (isDevelopment) {
                return {
                        ...baseConfig,
                        debug: true,
                        verbose: true,
                }
        }

        return {
                ...baseConfig,
                debug: false,
                verbose: false,
        }
}
```

### Mobile Optimization

```javascript
const createMobileConfig = () => {
        const isMobile = window.innerWidth < 768

        return {
                width: Math.min(800, window.innerWidth),
                height: Math.min(600, window.innerHeight),
                antialias: !isMobile,
                isWebGL: true, // Better mobile support
                count: isMobile ? 3 : 6,
        }
}
```

GLRE's configuration system provides flexible customization while maintaining sensible defaults for different platforms and environments.
