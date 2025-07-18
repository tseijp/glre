# Advanced Techniques

## Compute Shader Integration

### WebGPU Compute Pipeline

```javascript
// Compute shaderの定義
const computeShader = `
@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
        let resolution = uniforms.resolution;
        let uv = vec2f(id.xy) / resolution;

        // パーティクル物理計算
        let particle = particles[id.x + id.y * u32(resolution.x)];

        particle.velocity += force * deltaTime;
        particle.position += particle.velocity * deltaTime;

        particles[id.x + id.y * u32(resolution.x)] = particle;
}
`

// GLREとのintegration
const gl = createGL({
        isWebGL: false, // WebGPU required
        compute: computeShader,
        fragment: particleRenderer,
})

// Compute dispatchの実行
gl('loop', () => {
        gl.compute.dispatch(particleCount / 64, 1, 1)
})
```

### Particle System with Compute

| Component           | Purpose            | Implementation        |
| ------------------- | ------------------ | --------------------- |
| **Position Buffer** | Particle positions | `storage<read_write>` |
| **Velocity Buffer** | Movement vectors   | `storage<read_write>` |
| **Physics Compute** | Force calculations | Compute shader        |
| **Render Pipeline** | Visual output      | Fragment shader       |

```javascript
// パーティクルシステムの実装
const createParticleSystem = (count) => {
        // 初期データ
        const positions = new Float32Array(count * 3)
        const velocities = new Float32Array(count * 3)

        // ランダム初期化
        for (let i = 0; i < count * 3; i += 3) {
                positions[i] = Math.random() * 2 - 1 // x
                positions[i + 1] = Math.random() * 2 - 1 // y
                positions[i + 2] = Math.random() * 2 - 1 // z

                velocities[i] = (Math.random() - 0.5) * 0.1
                velocities[i + 1] = (Math.random() - 0.5) * 0.1
                velocities[i + 2] = (Math.random() - 0.5) * 0.1
        }

        // Storage buffers
        gl.storage('positions', positions)
        gl.storage('velocities', velocities)
        gl.uniform('particleCount', count)
}
```

## Multi-Pass Rendering

### Render Target Chain

```javascript
// レンダーターゲットの作成
const createRenderTargets = () => {
        const targets = {
                depth: gl.renderTarget('depth', { format: 'depth24plus' }),
                normal: gl.renderTarget('normal', { format: 'rgba16float' }),
                albedo: gl.renderTarget('albedo', { format: 'bgra8unorm' }),
                final: gl.renderTarget('final', { format: 'bgra8unorm' }),
        }

        return targets
}

// Multi-pass pipeline
const multiPassPipeline = (targets) => {
        // Pass 1: Geometry (G-Buffer)
        gl.pass('geometry', {
                targets: [targets.normal, targets.albedo],
                depth: targets.depth,
                fragment: geometryPass,
        })

        // Pass 2: Lighting
        gl.pass('lighting', {
                targets: [targets.final],
                inputs: [targets.normal, targets.albedo, targets.depth],
                fragment: lightingPass,
        })

        // Pass 3: Post-processing
        gl.pass('postprocess', {
                inputs: [targets.final],
                fragment: postProcessPass,
        })
}
```

### Deferred Rendering Pattern

| Pass             | Purpose            | Outputs               | Inputs      |
| ---------------- | ------------------ | --------------------- | ----------- |
| **Geometry**     | Scene geometry     | Normal, Albedo, Depth | Vertex data |
| **Lighting**     | Light calculations | Lit scene             | G-Buffer    |
| **Post-process** | Effects            | Final image           | Lit scene   |

```javascript
// G-Buffer generation
const geometryPass = () => {
        const worldPos = attribute('position').mul(uniform('modelMatrix'))
        const worldNormal = attribute('normal').mul(uniform('normalMatrix'))
        const uv = attribute('uv')

        return {
                normal: worldNormal.normalize().mul(0.5).add(0.5),
                albedo: texture(uniform('diffuseTexture'), uv),
                depth: worldPos.z,
        }
}

// Deferred lighting
const lightingPass = () => {
        const normal = texture(uniform('normalBuffer'), uv).xyz.mul(2).sub(1)
        const albedo = texture(uniform('albedoBuffer'), uv)
        const depth = texture(uniform('depthBuffer'), uv).r

        const worldPos = reconstructWorldPos(uv, depth)
        const lighting = calculateLighting(worldPos, normal, albedo)

        return vec4(lighting, 1)
}
```

## Custom Node Types

### Domain-Specific Functions

```javascript
// カスタムノード関数の定義
const noise3D = Fn(([position, scale, octaves]) => {
        let result = float(0)
        let amplitude = float(1)
        let frequency = scale

        Loop(octaves, ({ i }) => {
                const sample = noise(position.mul(frequency))
                result.assign(result.add(sample.mul(amplitude)))
                amplitude.assign(amplitude.mul(0.5))
                frequency.assign(frequency.mul(2))
        })

        return result
}).setLayout({
        name: 'noise3D',
        type: 'float',
        inputs: [
                { name: 'position', type: 'vec3' },
                { name: 'scale', type: 'float' },
                { name: 'octaves', type: 'int' },
        ],
})

// 使用例
const terrain = noise3D(worldPos, 0.01, 8)
```

### Material System

```javascript
// 物理ベースマテリアル
const PBRMaterial = struct({
        baseColor: 'vec3',
        metallic: 'float',
        roughness: 'float',
        normal: 'vec3',
        ao: 'float',
        emission: 'vec3',
})

const createPBR = (textures) => {
        return PBRMaterial({
                baseColor: texture(textures.albedo, uv).rgb,
                metallic: texture(textures.metallic, uv).r,
                roughness: texture(textures.roughness, uv).r,
                normal: normalFromTexture(textures.normal, uv),
                ao: texture(textures.ao, uv).r,
                emission: texture(textures.emission, uv).rgb,
        })
}
```

### Lighting Models

```javascript
// Cook-Torrance BRDF
const cookTorrance = Fn(([normal, view, light, material]) => {
        const h = normalize(view.add(light))
        const NdotV = max(0, dot(normal, view))
        const NdotL = max(0, dot(normal, light))
        const NdotH = max(0, dot(normal, h))
        const VdotH = max(0, dot(view, h))

        // Distribution term (GGX)
        const alpha = material.roughness.mul(material.roughness)
        const alpha2 = alpha.mul(alpha)
        const denom = NdotH.mul(NdotH).mul(alpha2.sub(1)).add(1)
        const D = alpha2.div(PI.mul(denom).mul(denom))

        // Geometry term
        const k = alpha.add(1).mul(alpha.add(1)).div(8)
        const G1V = NdotV.div(NdotV.mul(oneMinus(k)).add(k))
        const G1L = NdotL.div(NdotL.mul(oneMinus(k)).add(k))
        const G = G1V.mul(G1L)

        // Fresnel term
        const F0 = mix(vec3(0.04), material.baseColor, material.metallic)
        const F = F0.add(oneMinus(F0).mul(pow(oneMinus(VdotH), 5)))

        // Final BRDF
        const numerator = D.mul(G).mul(F)
        const denominator = max(0.001, NdotV.mul(NdotL).mul(4))

        return numerator.div(denominator)
})
```

## Performance Optimization

### Instanced Rendering

```javascript
// インスタンス描画の設定
const setupInstancing = (instanceCount) => {
        // インスタンスデータ
        const instanceTransforms = new Float32Array(instanceCount * 16)
        const instanceColors = new Float32Array(instanceCount * 4)

        for (let i = 0; i < instanceCount; i++) {
                // Transform matrix (4x4)
                const offset = i * 16
                const matrix = createTransformMatrix(
                        Math.random() * 10 - 5, // x
                        Math.random() * 10 - 5, // y
                        Math.random() * 10 - 5 // z
                )
                instanceTransforms.set(matrix, offset)

                // Color (RGBA)
                const colorOffset = i * 4
                instanceColors.set([Math.random(), Math.random(), Math.random(), 1.0], colorOffset)
        }

        gl.attribute('instanceTransform', instanceTransforms, { divisor: 1 })
        gl.attribute('instanceColor', instanceColors, { divisor: 1 })
        gl.count = baseGeometry.count * instanceCount
}
```

### Level-of-Detail (LOD)

```javascript
// 距離ベースLOD
const lodSystem = Fn(([worldPos, cameraPos, lodLevels]) => {
        const distance = length(worldPos.sub(cameraPos))

        return Switch(true)
                .Case(distance.lessThan(lodLevels.x), () => {
                        return highDetailMesh()
                })
                .Case(distance.lessThan(lodLevels.y), () => {
                        return mediumDetailMesh()
                })
                .Default(() => {
                        return lowDetailMesh()
                })
})
```

### Occlusion Culling

```javascript
// 視錐台カリング
const frustumCulling = Fn(([worldPos, mvpMatrix, boundingRadius]) => {
        const clipPos = mvpMatrix.mul(vec4(worldPos, 1))
        const ndcPos = clipPos.xyz.div(clipPos.w)

        // 境界チェック
        const visible = all(
                ndcPos
                        .add(boundingRadius)
                        .greaterThan(vec3(-1))
                        .and(ndcPos.sub(boundingRadius).lessThan(vec3(1)))
        )

        return visible
})
```

## Advanced Shader Techniques

### Volumetric Rendering

```javascript
// ボリューメトリックレンダリング
const volumetricFog = Fn(([rayOrigin, rayDirection, steps]) => {
        let density = float(0)
        let lighting = vec3(0)

        const stepSize = float(1).div(steps)

        Loop(steps, ({ i }) => {
                const t = float(i).mul(stepSize)
                const samplePos = rayOrigin.add(rayDirection.mul(t))

                // ボリューム密度のサンプリング
                const sampleDensity = noise3D(samplePos, 0.1, 4)
                density.assign(density.add(sampleDensity.mul(stepSize)))

                // ライティング計算
                const lightDir = normalize(uniform('lightPos').sub(samplePos))
                const lightIntensity = calculateVolumetricLighting(samplePos, lightDir)
                lighting.assign(lighting.add(lightIntensity.mul(sampleDensity).mul(stepSize)))
        })

        return vec4(lighting, density)
})
```

### Subsurface Scattering

```javascript
// サブサーフェス散乱
const subsurfaceScattering = Fn(([normal, view, light, thickness, scatterColor]) => {
        // Forward scattering
        const VdotL = dot(view.negate(), light)
        const forwardScatter = pow(saturate(VdotL), 4)

        // Back scattering
        const backLight = light.add(normal.mul(thickness))
        const VdotBL = dot(view.negate(), normalize(backLight))
        const backScatter = pow(saturate(VdotBL), 4)

        // 散乱強度
        const scattering = forwardScatter.add(backScatter).mul(scatterColor)

        return scattering
})
```

### Screen-Space Reflections

```javascript
// スクリーンスペース反射
const screenSpaceReflections = Fn(([screenPos, normal, depth, maxSteps]) => {
        const worldPos = reconstructWorldPos(screenPos, depth)
        const view = normalize(uniform('cameraPos').sub(worldPos))
        const reflection = reflect(view.negate(), normal)

        // レイマーチング
        let hitColor = vec3(0)
        let currentPos = worldPos
        const stepSize = uniform('ssrStepSize')

        Loop(maxSteps, ({ i }) => {
                currentPos.assign(currentPos.add(reflection.mul(stepSize)))
                const screenCoord = worldToScreen(currentPos)

                If(isValidScreenCoord(screenCoord), () => {
                        const sampledDepth = texture(uniform('depthBuffer'), screenCoord).r
                        const sampledWorldPos = reconstructWorldPos(screenCoord, sampledDepth)

                        If(abs(currentPos.z.sub(sampledWorldPos.z)).lessThan(uniform('ssrThreshold')), () => {
                                hitColor.assign(texture(uniform('colorBuffer'), screenCoord).rgb)
                                Break()
                        })
                })
        })

        return hitColor
})
```

## Debugging and Profiling

### Visual Debugging

```javascript
// デバッグ表示モード
const debugVisualization = Fn(([mode, data]) => {
        return Switch(mode)
                .Case(0, () => data) // Normal rendering
                .Case(1, () => vec4(data.normal.mul(0.5).add(0.5), 1)) // Normals
                .Case(2, () => vec4(data.depth.xxx, 1)) // Depth
                .Case(3, () => vec4(data.uv, 0, 1)) // UV coordinates
                .Case(4, () => vec4(data.worldPos.mul(0.1), 1)) // World position
                .Default(() => vec4(1, 0, 1, 1)) // Error color
})
```

### Performance Profiling

```javascript
// GPU タイマー (WebGPU)
const createGPUProfiler = () => {
        const querySet = device.createQuerySet({
                type: 'timestamp',
                count: 2,
        })

        return {
                begin: (pass) => pass.writeTimestamp(querySet, 0),
                end: (pass) => pass.writeTimestamp(querySet, 1),
                read: async () => {
                        const results = await device.queue.readBuffer(querySet.buffer)
                        const times = new BigUint64Array(results)
                        return Number(times[1] - times[0]) / 1000000 // ms
                },
        }
}
```

### Error Visualization

```javascript
// シェーダーエラーの可視化
const errorVisualization = Fn(([value, expectedRange]) => {
        const isNaN = value.notEqual(value)
        const isInf = abs(value).greaterThan(float(1e30))
        const isOutOfRange = value.lessThan(expectedRange.x).or(value.greaterThan(expectedRange.y))

        const errorColor = select(
                isNaN,
                vec3(1, 0, 1), // Magenta for NaN
                select(
                        isInf,
                        vec3(1, 1, 0), // Yellow for infinity
                        select(
                                isOutOfRange,
                                vec3(1, 0.5, 0), // Orange for out of range
                                vec3(0, 1, 0) // Green for valid
                        )
                )
        )

        return vec4(errorColor, 1)
})
```

GLRE の高度な技術は、最新の GPU プログラミング手法を TypeScript の表現力で活用し、プロフェッショナルレベルの視覚効果を実現します。
