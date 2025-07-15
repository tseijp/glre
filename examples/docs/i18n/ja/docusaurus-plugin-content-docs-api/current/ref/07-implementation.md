# Implementation Patterns

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
// 基本的なuniform設定
gl.uniform('time', 0)
gl.uniform('resolution', [800, 600])
gl.uniform('color', [1, 0.5, 0.2, 1])

// 型別uniform例
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
// 時間ベースの更新
gl('loop', () => {
        const time = performance.now() / 1000
        gl.uniform('iTime', time)
        gl.uniform('oscillation', Math.sin(time))
})

// インタラクティブな更新
gl('mousemove', (event, x, y) => {
        const [width, height] = gl.size
        gl.uniform('iMouse', [x / width, 1.0 - y / height])
})

// 条件付き更新
const updateQuality = durable((quality) => {
        gl.uniform('sampleCount', quality === 'high' ? 64 : 16)
        gl.uniform('noiseOctaves', quality === 'high' ? 8 : 4)
}, gl)
```

### Texture Uniforms

```javascript
// テクスチャのロード
gl.texture('mainTexture', './assets/texture.jpg')
gl.texture('normalMap', './assets/normal.jpg')
gl.texture('heightMap', './assets/height.jpg')

// テクスチャ配列
const textures = ['tex1.jpg', 'tex2.jpg', 'tex3.jpg']
textures.forEach((path, index) => {
        gl.texture(`texture${index}`, path)
})

// キューブマップ
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
// 基本的なvertex attributes
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
// フルスクリーンクワッド
const createQuad = () => {
        gl.attribute('position', [-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0])
        gl.count = 6
}

// プロシージャルジオメトリ
const createSphere = (radius, segments) => {
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

        gl.attribute('position', vertices)
        gl.attribute('normal', normals)
        gl.attribute('uv', uvs)
}
```

## Animation Patterns

### Time-Based Animation

```javascript
// 基本的な時間アニメーション
gl('loop', () => {
        const time = performance.now() / 1000

        // 単純な振動
        gl.uniform('oscillation', Math.sin(time))

        // 回転アニメーション
        gl.uniform('rotation', time * 0.5)

        // イージング関数
        const eased = 0.5 * (1 + Math.sin(time * 2 - Math.PI / 2))
        gl.uniform('progress', eased)
})
```

### Interactive Animation

```javascript
// マウス追従アニメーション
let targetMouse = [0, 0]
let currentMouse = [0, 0]

gl('mousemove', (event, x, y) => {
        const [width, height] = gl.size
        targetMouse = [(x / width) * 2 - 1, -((y / height) * 2 - 1)]
})

gl('loop', () => {
        // スムースな補間
        currentMouse[0] += (targetMouse[0] - currentMouse[0]) * 0.1
        currentMouse[1] += (targetMouse[1] - currentMouse[1]) * 0.1

        gl.uniform('mousePos', currentMouse)
})
```

### State Machine Animation

```javascript
// アニメーション状態管理
const animationStates = {
        idle: { duration: 2000, next: 'active' },
        active: { duration: 1000, next: 'cooling' },
        cooling: { duration: 500, next: 'idle' },
}

let currentState = 'idle'
let stateStartTime = performance.now()

gl('loop', () => {
        const now = performance.now()
        const elapsed = now - stateStartTime
        const state = animationStates[currentState]

        if (elapsed >= state.duration) {
                currentState = state.next
                stateStartTime = now
        }

        const progress = elapsed / state.duration
        gl.uniform('animationState', currentState === 'active' ? 1 : 0)
        gl.uniform('stateProgress', progress)
})
```

## Error Handling Patterns

### Graceful Degradation

```javascript
// WebGPU フォールバック
const createGLWithFallback = (config) => {
        try {
                if (navigator.gpu && config.preferWebGPU !== false) {
                        return createGL({ ...config, isWebGL: false })
                }
        } catch (error) {
                console.warn('WebGPU failed, falling back to WebGL:', error)
        }

        return createGL({ ...config, isWebGL: true })
}
```

### Shader Compilation Error Handling

```javascript
// シェーダーエラーハンドリング
const createShaderWithFallback = (shader, fallback) => {
        const gl = createGL({
                fragment: shader,
                onError: (error) => {
                        console.error('Shader compilation failed:', error)
                        gl.fragment = fallback
                        gl('mount') // 再コンパイル
                },
        })
}
```

### Resource Loading Error Handling

```javascript
// テクスチャロードエラー対応
const loadTextureWithFallback = (name, url, fallbackColor = [1, 0, 1, 1]) => {
        gl.texture(name, url).catch((error) => {
                console.warn(`Failed to load texture ${url}:`, error)
                // 1x1 フォールバックテクスチャ
                gl.uniform(name, fallbackColor)
        })
}
```

## Performance Optimization Patterns

### Batched Updates

```javascript
// バッチ更新パターン
const batchedUpdate = () => {
        // 複数のuniformを一度に更新
        gl.queue.uniform('time', performance.now() / 1000)
        gl.queue.uniform('resolution', gl.size)
        gl.queue.uniform('mousePos', mousePosition)

        // 一括フラッシュ
        gl.queue.flush()
}

gl('loop', batchedUpdate)
```

### Memory-Efficient Patterns

```javascript
// オブジェクトプールパターン
const vec3Pool = []
const getVec3 = () => vec3Pool.pop() || vec3(0, 0, 0)
const releaseVec3 = (v) => vec3Pool.push(v)

// 再利用可能なuniform更新
const reusableUniforms = {
        update(time, resolution, mouse) {
                this.time = time
                this.resolution = resolution
                this.mouse = mouse
                return this
        },
}
```

### Conditional Rendering

```javascript
// 条件付きレンダリング
let needsUpdate = true

gl('loop', () => {
        if (!needsUpdate) return

        // 重い計算を必要な時のみ実行
        const complexValue = expensiveCalculation()
        gl.uniform('complexValue', complexValue)

        needsUpdate = false
})

// 変更検知
gl('mousemove', () => {
        needsUpdate = true
})
gl('resize', () => {
        needsUpdate = true
})
```

## Platform Integration Patterns

### React Integration

```javascript
const GLREComponent = ({ shader, uniforms }) => {
        const canvasRef = useRef()
        const glRef = useRef()

        useEffect(() => {
                glRef.current = createGL({
                        el: canvasRef.current,
                        fragment: shader,
                })

                return () => glRef.current?.('clean')
        }, [shader])

        useEffect(() => {
                if (glRef.current && uniforms) {
                        Object.entries(uniforms).forEach(([key, value]) => {
                                glRef.current.uniform(key, value)
                        })
                }
        }, [uniforms])

        return <canvas ref={canvasRef} />
}
```

### React Native Integration

```javascript
// React Native WebGL統合
import { GLView } from 'expo-gl'

const GLREView = ({ fragment }) => {
        const onContextCreate = (gl) => {
                const glre = createGL({
                        context: gl,
                        isNative: true,
                        fragment,
                })

                // React Native specific setup
                glre.isLoop = true
        }

        return <GLView style={styles.container} onContextCreate={onContextCreate} />
}
```

GLRE の実装パターンは、効率的で保守可能なコードを書くための確立されたベストプラクティスを提供します。
