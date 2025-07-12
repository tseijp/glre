# Advanced Techniques

Complex rendering techniques and advanced GLRE features.

## Multi-Pass Rendering

### Render Target Chain

```javascript
// Create render targets using closures
const createRenderTargets = () => {
        const targets = {
                depth: gl.renderTarget('depth', { format: 'depth24plus' }),
                normal: gl.renderTarget('normal', { format: 'rgba16float' }),
                albedo: gl.renderTarget('albedo', { format: 'bgra8unorm' }),
                final: gl.renderTarget('final', { format: 'bgra8unorm' }),
        }

        return targets
}

// Multi-pass pipeline using functional composition
const createMultiPassPipeline = (targets) => {
        const geometryPass = () => {
                gl.pass('geometry', {
                        targets: [targets.normal, targets.albedo],
                        depth: targets.depth,
                        fragment: geometryShader,
                })
        }

        const lightingPass = () => {
                gl.pass('lighting', {
                        targets: [targets.final],
                        inputs: [targets.normal, targets.albedo, targets.depth],
                        fragment: lightingShader,
                })
        }

        const postProcessPass = () => {
                gl.pass('postprocess', {
                        inputs: [targets.final],
                        fragment: postProcessShader,
                })
        }

        const execute = () => {
                geometryPass()
                lightingPass()
                postProcessPass()
        }

        return { geometryPass, lightingPass, postProcessPass, execute }
}
```

### Deferred Rendering Pattern

| Pass             | Purpose            | Outputs               | Inputs      |
| ---------------- | ------------------ | --------------------- | ----------- |
| **Geometry**     | Scene geometry     | Normal, Albedo, Depth | Vertex data |
| **Lighting**     | Light calculations | Lit scene             | G-Buffer    |
| **Post-process** | Effects            | Final image           | Lit scene   |

```javascript
// G-Buffer generation shader
const createGeometryPass = () => {
        return () => {
                const worldPos = attribute('position').mul(uniform('modelMatrix'))
                const worldNormal = attribute('normal').mul(uniform('normalMatrix'))
                const uv = attribute('uv')

                return {
                        normal: worldNormal.normalize().mul(0.5).add(0.5),
                        albedo: texture(uniform('diffuseTexture'), uv),
                        depth: worldPos.z,
                }
        }
}

// Deferred lighting shader
const createLightingPass = () => {
        return () => {
                const normal = texture(uniform('normalBuffer'), uv).xyz.mul(2).sub(1)
                const albedo = texture(uniform('albedoBuffer'), uv)
                const depth = texture(uniform('depthBuffer'), uv).r

                const worldPos = reconstructWorldPos(uv, depth)
                const lighting = calculateLighting(worldPos, normal, albedo)

                return vec4(lighting, 1)
        }
}
```

## Custom Node Types

### Domain-Specific Functions

```javascript
// Custom noise function using functional approach
const createNoise3D = () => {
        return Fn(([position, scale, octaves]) => {
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
}

// Usage
const noise3D = createNoise3D()
const terrain = noise3D(worldPos, 0.01, 8)
```

### Material System

```javascript
// PBR Material system using closures
const createPBRMaterial = () => {
        const materialStruct = struct({
                baseColor: 'vec3',
                metallic: 'float',
                roughness: 'float',
                normal: 'vec3',
                ao: 'float',
                emission: 'vec3',
        })

        const createFromTextures = (textures) => {
                return materialStruct({
                        baseColor: texture(textures.albedo, uv).rgb,
                        metallic: texture(textures.metallic, uv).r,
                        roughness: texture(textures.roughness, uv).r,
                        normal: normalFromTexture(textures.normal, uv),
                        ao: texture(textures.ao, uv).r,
                        emission: texture(textures.emission, uv).rgb,
                })
        }

        return { materialStruct, createFromTextures }
}
```

### Lighting Models

```javascript
// Cook-Torrance BRDF implementation
const createCookTorranceBRDF = () => {
        return Fn(([normal, view, light, material]) => {
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
}
```

## Compute Shader Integration

### WebGPU Compute Pipeline

```javascript
// Compute shader for particle physics
const particleComputeShader = `
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let index = id.x;
    if (index >= arrayLength(&particles)) {
        return;
    }
    
    var particle = particles[index];
    
    // Physics calculation
    particle.velocity += particle.acceleration * uniforms.deltaTime;
    particle.position += particle.velocity * uniforms.deltaTime;
    
    // Lifetime
    particle.life -= uniforms.deltaTime;
    
    // Gravity
    particle.acceleration.y = -9.8;
    
    particles[index] = particle;
}
`

// GLRE integration using closures
const createParticleSystem = (particleCount) => {
        const gl = createGL({
                isWebGL: false, // WebGPU required
                compute: particleComputeShader,
                fragment: particleRenderer,
        })

        const particleData = new Float32Array(particleCount * 8) // position, velocity, life, size
        gl.storage('particles', particleData)

        const update = (deltaTime) => {
                gl.uniform('deltaTime', deltaTime)
                gl.compute.dispatch(Math.ceil(particleCount / 64), 1, 1)
        }

        return { update, gl }
}
```

### Particle System with Compute

| Component           | Purpose            | Implementation        |
| ------------------- | ------------------ | --------------------- |
| **Position Buffer** | Particle positions | `storage<read_write>` |
| **Velocity Buffer** | Movement vectors   | `storage<read_write>` |
| **Physics Compute** | Force calculations | Compute shader        |
| **Render Pipeline** | Visual output      | Fragment shader       |

```javascript
// Particle system using functional approach
const createGPUParticleSystem = (count) => {
        // Initialize data
        const initializeParticleData = () => {
                const positions = new Float32Array(count * 3)
                const velocities = new Float32Array(count * 3)

                // Random initialization
                for (let i = 0; i < count * 3; i += 3) {
                        positions[i] = Math.random() * 2 - 1 // x
                        positions[i + 1] = Math.random() * 2 - 1 // y
                        positions[i + 2] = Math.random() * 2 - 1 // z

                        velocities[i] = (Math.random() - 0.5) * 0.1
                        velocities[i + 1] = (Math.random() - 0.5) * 0.1
                        velocities[i + 2] = (Math.random() - 0.5) * 0.1
                }

                return { positions, velocities }
        }

        const data = initializeParticleData()

        // Storage buffers
        gl.storage('positions', data.positions)
        gl.storage('velocities', data.velocities)
        gl.uniform('particleCount', count)

        return { data }
}
```

## Advanced Shader Techniques

### Volumetric Rendering

```javascript
// Volumetric fog implementation
const createVolumetricFog = () => {
        return Fn(([rayOrigin, rayDirection, steps]) => {
                let density = float(0)
                let lighting = vec3(0)

                const stepSize = float(1).div(steps)

                Loop(steps, ({ i }) => {
                        const t = float(i).mul(stepSize)
                        const samplePos = rayOrigin.add(rayDirection.mul(t))

                        // Volume density sampling
                        const sampleDensity = noise3D(samplePos, 0.1, 4)
                        density.assign(density.add(sampleDensity.mul(stepSize)))

                        // Lighting calculation
                        const lightDir = normalize(uniform('lightPos').sub(samplePos))
                        const lightIntensity = calculateVolumetricLighting(samplePos, lightDir)
                        lighting.assign(lighting.add(lightIntensity.mul(sampleDensity).mul(stepSize)))
                })

                return vec4(lighting, density)
        })
}
```

### Subsurface Scattering

```javascript
// Subsurface scattering implementation
const createSubsurfaceScattering = () => {
        return Fn(([normal, view, light, thickness, scatterColor]) => {
                // Forward scattering
                const VdotL = dot(view.negate(), light)
                const forwardScatter = pow(saturate(VdotL), 4)

                // Back scattering
                const backLight = light.add(normal.mul(thickness))
                const VdotBL = dot(view.negate(), normalize(backLight))
                const backScatter = pow(saturate(VdotBL), 4)

                // Scattering intensity
                const scattering = forwardScatter.add(backScatter).mul(scatterColor)

                return scattering
        })
}
```

### Screen-Space Reflections

```javascript
// Screen-space reflections using ray marching
const createScreenSpaceReflections = () => {
        return Fn(([screenPos, normal, depth, maxSteps]) => {
                const worldPos = reconstructWorldPos(screenPos, depth)
                const view = normalize(uniform('cameraPos').sub(worldPos))
                const reflection = reflect(view.negate(), normal)

                // Ray marching
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
}
```

## Level-of-Detail (LOD)

### Distance-Based LOD

```javascript
// LOD system using closures
const createLODSystem = () => {
        return Fn(([worldPos, cameraPos, lodLevels]) => {
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
}
```

### Occlusion Culling

```javascript
// Frustum culling implementation
const createFrustumCulling = () => {
        return Fn(([worldPos, mvpMatrix, boundingRadius]) => {
                const clipPos = mvpMatrix.mul(vec4(worldPos, 1))
                const ndcPos = clipPos.xyz.div(clipPos.w)

                // Boundary check
                const visible = all(
                        ndcPos
                                .add(boundingRadius)
                                .greaterThan(vec3(-1))
                                .and(ndcPos.sub(boundingRadius).lessThan(vec3(1)))
                )

                return visible
        })
}
```

## Debugging and Profiling

### Visual Debugging

```javascript
// Debug visualization modes
const createDebugVisualization = () => {
        return Fn(([mode, data]) => {
                return Switch(mode)
                        .Case(0, () => data) // Normal rendering
                        .Case(1, () => vec4(data.normal.mul(0.5).add(0.5), 1)) // Normals
                        .Case(2, () => vec4(data.depth.xxx, 1)) // Depth
                        .Case(3, () => vec4(data.uv, 0, 1)) // UV coordinates
                        .Case(4, () => vec4(data.worldPos.mul(0.1), 1)) // World position
                        .Default(() => vec4(1, 0, 1, 1)) // Error color
        })
}
```

### Error Visualization

```javascript
// Shader error visualization
const createErrorVisualization = () => {
        return Fn(([value, expectedRange]) => {
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
}
```

## Instanced Rendering

### Large-Scale Object Rendering

```javascript
// Instanced rendering setup using closures
const createInstancedRenderer = (instanceCount) => {
        const setupInstancing = () => {
                // Instance data
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

        return { setupInstancing }
}
```

## Texture Arrays and Atlases

### Texture Array Management

```javascript
// Texture array system using closures
const createTextureArray = () => {
        const textures = []
        let textureArray = null

        const addTexture = (url) => {
                textures.push(url)
        }

        const build = async () => {
                const images = await Promise.all(textures.map((url) => loadImage(url)))

                textureArray = createTextureArrayFromImages(images)
                return textureArray
        }

        const sample = (index, uv) => {
                return texture(textureArray, vec3(uv, index))
        }

        return { addTexture, build, sample }
}
```

## Post-Processing Pipeline

### Effect Chain

```javascript
// Post-processing effect chain using functional composition
const createEffectChain = () => {
        const effects = []

        const addEffect = (effect) => {
                effects.push(effect)
        }

        const process = (inputTexture) => {
                return effects.reduce((currentTexture, effect) => {
                        return effect(currentTexture)
                }, inputTexture)
        }

        // Common effects
        const bloom = (input) => {
                const bright = extractBrightPixels(input)
                const blurred = gaussianBlur(bright)
                return addBlend(input, blurred)
        }

        const tonemap = (input) => {
                return reinhardTonemap(input)
        }

        return { addEffect, process, bloom, tonemap }
}

// Usage
const postProcess = createEffectChain()
postProcess.addEffect(postProcess.bloom)
postProcess.addEffect(postProcess.tonemap)
```

These advanced techniques enable complex visual effects and optimizations while maintaining the functional programming principles that make GLRE code maintainable and efficient.
