# Implementing

### ✅ Simple rendering (Texture: 0, Pass: 1)

```jsx
function Canvas() {
        const gl = useGL({ frag: vec4(uv, 0, 1) })
        return <canvas ref={gl.ref} />
}
```

### ✅ Multiple Pipeline → Canvas (Pass: 1)

```jsx
function Canvas() {
        const position = attribute([0, 0.37, -0.5, -0.5, 0.5, -0.5])
        const gl = useGL(
                { triangleCount: 1, vert: vec4(vec2(-0.5, 0).add(position), 0, 1), frag: vec4(1, 0, 0, 1) }, // canvas rendering
                { triangleCount: 1, vert: vec4(vec2(0.5, 0).add(position), 0, 1), frag: vec4(0, 0, 1, 1) } // canvas rendering
        )
        return <canvas ref={gl.ref} />
}
```

### 🚧 Postprocessing (Texture: 2, Pass: 2)

```jsx
function Canvas() {
        const to = storage()
        const gl = useGL(
                { frag: vec4(uv, 0, 1), to }, // offscreen rendering
                { frag: texture(to, uv) }
        )
        return <canvas ref={gl.ref} />
}
```

### 🚧 Multiple Postprocessing (Texture: 2 ping-pong, Pass: N+1)

```jsx
function Canvas() {
        const a = storage()
        const b = storage()
        const gl = useGL(
                { frag: vec4(uv, 0, 1), to: a }, //
                { frag: texture(a, uv), to: b },
                { frag: texture(b, uv) }
        )
        return <canvas ref={gl.ref} />
}
```

### 🚧 Multiple Pipeline → Offscreen Texture (Pass: 1)

```jsx
function Canvas() {
        const to = storage({ width: 1024, height: 1024 })
        const position = attribute([0, 0.37, -0.5, -0.5, 0.5, -0.5])
        const gl = useGL(
                { triangleCount: 1, vert: vec4(vec2(-0.5, 0).add(position), 0, 1), frag: vec4(1, 0, 0, 1), to }, // offscreen rendering
                { triangleCount: 1, vert: vec4(vec2(0.5, 0).add(position), 0, 1), frag: vec4(0, 0, 1, 1), to }, // offscreen  rendering
                { frag: texture(scene, uv) }
        )
        return <canvas ref={gl.ref} />
}
```

### 🚧 Compute → Render (Buffer: 1-2, Pass: 2)

```jsx
function Canvas() {
        const particles = storage(vec4(new Array(1024 * 4)))
        const gl = useGL(
                {
                        compute: Scope(() => {
                                const pos = particles.element(id.x.mul(uint(4)))
                                const vel = particles.element(id.x.mul(uint(4)).add(uint(2)))
                                const newPos = pos.add(vel.mul(deltaTime))
                                particles.element(uint(4).mul(id.x)).assign(newPos) // offscreen rendering
                        }),
                },
                { triangleCount: 1024, vert: vec4(particles.element(uint(4).mul(vertexIndex)).xy, 0, 1) }
        )
        return <canvas ref={gl.ref} />
}
```

### 🚧 Compute → Compute → Render (Buffer: 2, Pass: 3)

```jsx
function Canvas() {
        const particles = storage(vec4(new Array(1024 * 4)))
        const forces = storage(vec4(new Array(1024 * 4)))
        const gl = useGL(
                {
                        compute: Scope(() => {
                                const pos = particles.element(id.x.mul(uint(4)))
                                const force = vec2(0)
                                For(uint(0), uint(1024), (i) => {
                                        If(i.notEqual(id.x), () => {
                                                const otherPos = particles.element(i.mul(uint(4)))
                                                const dir = otherPos.sub(pos)
                                                const dist = length(dir)
                                                const f = dir.div(dist.mul(dist).add(0.01))
                                                force.assign(force.add(f))
                                        })
                                })
                                forces.element(id.x.mul(uint(4))).assign(force)
                        }),
                },
                {
                        compute: Scope(() => {
                                const pos = particles.element(id.x.mul(uint(4)))
                                const vel = particles.element(id.x.mul(uint(4)).add(uint(2)))
                                const force = forces.element(id.x.mul(uint(4)))
                                const newVel = vel.add(force.mul(deltaTime))
                                const newPos = pos.add(newVel.mul(deltaTime))
                                particles.element(id.x.mul(uint(4))).assign(newPos)
                                particles.element(id.x.mul(uint(4)).add(uint(2))).assign(newVel)
                        }),
                },
                { triangleCount: 1024, vert: vec4(particles.element(uint(4).mul(vertexIndex)), 0, 1) }
        )
        return <canvas ref={gl.ref} />
}
```

### 🚧 Deferred Shading (Texture: 4-5, Pass: 2, MRT)

```jsx
function Canvas() {
        const viewDir = uniform(vec3(0, 0, -1))
        const lightDir = uniform(vec3(0, -1, -1))
        const lightPos = uniform(vec3(1, 2, 3))
        const cameraPos = uniform(vec3(0, 0, 3))
        const diffuseMap = uniform('...')
        const depth = storage()
        const albedo = storage()
        const normal = storage()
        const position = storage()
        const gl = useGL(
                {
                        triangleCount: 12, // 6 × 2
                        vert: '...',
                        frag: Scope(() => {
                                albedo.value = texture(diffuseMap, texCoord)
                                normal.value = vec4(attribute([]), 1)
                                position.value = vec4(position, 1)
                        }),
                },
                {
                        frag: Scope(() => {
                                const viewDir = normalize(cameraPos.sub(position))
                                const lightDir = normalize(lightPos.sub(position))
                                const halfDir = normalize(viewDir.add(lightDir))
                                const ambient = albedo.xyz.mul(0.1)
                                const diffuse = albedo.xyz.mul(max(dot(normal, lightDir), 0))
                                const specular = vec3(pow(max(dot(normal, halfDir), 0), 32))
                                return vec4(ambient.add(diffuse).add(specular), 1)
                        }),
                }
        )
        return <canvas ref={gl.ref} />
}
```

### 🚧 Complicated Compute → Multiple Render → MRT → Lighting

```jsx
function Canvas() {
        const depth = storage()
        const albedo = storage()
        const normal = storage()
        const particles = storage()
        const sceneColor = storage()
        const gl = useGL(
                {
                        compute: Scope(() => {
                                // physics compute shader here
                        }),
                },
                { triangleCount: 1024, vert: vec4(particles.element(vertexIndex.mul(uint(4))), 0, 1), to: sceneColor },
                { triangleCount: 1024, vert: '...', to: sceneColor },
                {
                        triangleCount: 1024,
                        vertex: '...',
                        frag: Scope(() => {
                                albedo.value = texture(diffuseMap, texCoord)
                                normal.value = vec4(attribute([]), 1)
                        }),
                },
                {
                        frag: Scope(() => {
                                const albedo = texture(gAlbedo, uv)
                                const normal = texture(gNormal, uv)
                                const scene = texture(sceneColor, uv)
                                const light = computeLighting(albedo, normal)
                                return mix(light, scene, 0.5)
                        }),
                }
        )
        return <canvas ref={gl.ref} />
}
```
