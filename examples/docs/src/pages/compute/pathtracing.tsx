import { Fn, id, storage, uv, UVec3, Vec2, vec4, vec2, uniform, vec3, If, float, Loop, uint, Break } from 'glre/src/node'
import { useGL, isServer } from 'glre/src/react'

const isWebGL = false

export default function PathtracingApp() {
        const [w, h] = isServer() ? [0, 0] : [window.innerWidth, window.innerHeight]
        const pixels = w * h

        // Storage for accumulated pixel colors
        const pixelData = storage(vec4(), 'pixelData') // xyz: color, w: sample count

        // Camera uniforms
        const cameraPos = uniform(vec3(0, 0, -3), 'cameraPos')
        const cameraDir = uniform(vec3(0, 0, 1), 'cameraDir')
        const cameraUp = uniform(vec3(0, 1, 0), 'cameraUp')
        const fov = uniform(60, 'fov')
        const frameCount = uniform(float(0), 'frameCount')

        // Sphere data (position + radius packed)
        const sphere1 = vec4(0, 0, 0, 1)
        const sphere2 = vec4(-2.5, 0, 0, 1)
        const sphere3 = vec4(2.5, 0, 0, 1)
        const sphere4 = vec4(0, -101, 0, 100) // Ground sphere

        // Light sphere
        const lightSphere = uniform(vec4(3, 3, -3, 0.5), 'lightSphere')

        // Material colors
        const mat1Color = vec3(1.0, 0.2, 0.2)
        const mat2Color = vec3(0.2, 1.0, 0.2)
        const mat3Color = vec3(0.2, 0.2, 1.0)
        const mat4Color = vec3(0.8, 0.8, 0.8) // Ground
        const lightColor = vec3(20, 20, 20) // Emissive

        // Compute shader for path tracing
        const cs = Fn(([id]: [UVec3]) => {
                const idx = id.x.toFloat().toVar('idx')
                const x = idx.mod(w).toVar('x')
                const y = idx.div(w).floor().toVar('y')

                // Random number generation (simple hash)
                const hash = (seed: any) => {
                        const s = seed.mul(uint(747796405)).add(uint(2891336453))
                        const s2 = s.bitXor(
                                s
                                        .shiftRight(s.shiftRight(s.bitXor(s.shiftRight(uint(13))).mul(uint(5))))
                                        .bitXor(s.shiftRight(uint(5)))
                                        .mul(uint(5))
                        )
                        return s2.toFloat().div(4294967296.0).add(0.5)
                }

                const randomSeed = frameCount.mul(pixels).add(idx).toUInt().toVar('randomSeed')

                // Get random values
                const rand1 = hash(randomSeed).toVar('rand1')
                const rand2 = hash(randomSeed.add(uint(1))).toVar('rand2')

                // Jittered sampling for anti-aliasing
                const jitterX = rand1.sub(0.5).toVar('jitterX')
                const jitterY = rand2.sub(0.5).toVar('jitterY')

                // Normalized device coordinates (-1 to 1) with jitter
                const ndcX = x.add(jitterX).div(w).mul(2).sub(1).toVar('ndcX')
                const ndcY = y.add(jitterY).div(h).mul(2).sub(1).negate().toVar('ndcY')

                // Calculate ray direction
                const aspectRatio = float(w / h)
                const tanFov = fov.mul(0.0174533).div(2).tan().toVar('tanFov')
                const right = cameraDir.cross(cameraUp).normalize().toVar('right')
                const up = right.cross(cameraDir).normalize().toVar('up')

                const rayDir = cameraDir
                        .add(right.mul(ndcX.mul(tanFov).mul(aspectRatio)))
                        .add(up.mul(ndcY.mul(tanFov)))
                        .normalize()
                        .toVar('rayDir')

                const rayOrigin = cameraPos.toVar('rayOrigin')

                // Ray-sphere intersection function
                const raySphereIntersect = (origin: any, dir: any, sphereCenter: any, radius: any) => {
                        const oc = origin.sub(sphereCenter)
                        const a = dir.dot(dir)
                        const b = oc.dot(dir).mul(2)
                        const c = oc.dot(oc).sub(radius.pow(2))
                        const discriminant = b.pow(2).sub(a.mul(c).mul(4))

                        const t = b.negate().sub(discriminant.sqrt()).div(a.mul(2))
                        return vec2(discriminant, t)
                }

                // Find closest intersection
                const findIntersection = (origin: any, dir: any) => {
                        const result1 = raySphereIntersect(origin, dir, sphere1.xyz, sphere1.w)
                        const result2 = raySphereIntersect(origin, dir, sphere2.xyz, sphere2.w)
                        const result3 = raySphereIntersect(origin, dir, sphere3.xyz, sphere3.w)
                        const result4 = raySphereIntersect(origin, dir, sphere4.xyz, sphere4.w)
                        const resultLight = raySphereIntersect(origin, dir, lightSphere.xyz, lightSphere.w)

                        const minT = float(10000).toVar()
                        const hitId = float(-1).toVar()

                        // Check all spheres
                        If(result1.x.greaterThan(0).and(result1.y.greaterThan(0.001)).and(result1.y.lessThan(minT)), () => {
                                minT.assign(result1.y)
                                hitId.assign(0)
                        })

                        If(result2.x.greaterThan(0).and(result2.y.greaterThan(0.001)).and(result2.y.lessThan(minT)), () => {
                                minT.assign(result2.y)
                                hitId.assign(1)
                        })

                        If(result3.x.greaterThan(0).and(result3.y.greaterThan(0.001)).and(result3.y.lessThan(minT)), () => {
                                minT.assign(result3.y)
                                hitId.assign(2)
                        })

                        If(result4.x.greaterThan(0).and(result4.y.greaterThan(0.001)).and(result4.y.lessThan(minT)), () => {
                                minT.assign(result4.y)
                                hitId.assign(3)
                        })

                        If(resultLight.x.greaterThan(0).and(resultLight.y.greaterThan(0.001)).and(resultLight.y.lessThan(minT)), () => {
                                minT.assign(resultLight.y)
                                hitId.assign(4)
                        })

                        return vec3(minT, hitId, 0)
                }

                // Path tracing
                const pathColor = vec3(0, 0, 0).toVar('pathColor')
                const throughput = vec3(1, 1, 1).toVar('throughput')
                const currentOrigin = rayOrigin.toVar('currentOrigin')
                const currentDir = rayDir.toVar('currentDir')

                const maxBounces = 2
                Loop(maxBounces, ({ i }) => {
                        const hitInfo = findIntersection(currentOrigin, currentDir).toVar()
                        const t = hitInfo.x
                        const hitId = hitInfo.y

                        If(hitId.lessThan(0), () => {
                                // Sky color
                                const skyColor = vec3(0.2, 0.3, 0.5)
                                pathColor.assign(pathColor.add(throughput.mul(skyColor)))
                        }).Else(() => {
                                const hitPoint = currentOrigin.add(currentDir.mul(t)).toVar()
                                const normal = vec3(0, 0, 0).toVar()
                                const material = vec3(0, 0, 0).toVar()

                                // Get hit normal and material
                                If(hitId.equal(0), () => {
                                        normal.assign(hitPoint.sub(sphere1.xyz).normalize())
                                        material.assign(mat1Color)
                                })
                                If(hitId.equal(1), () => {
                                        normal.assign(hitPoint.sub(sphere2.xyz).normalize())
                                        material.assign(mat2Color)
                                })
                                If(hitId.equal(2), () => {
                                        normal.assign(hitPoint.sub(sphere3.xyz).normalize())
                                        material.assign(mat3Color)
                                })
                                If(hitId.equal(3), () => {
                                        normal.assign(hitPoint.sub(sphere4.xyz).normalize())
                                        material.assign(mat4Color)
                                })
                                If(hitId.equal(4), () => {
                                        // Light source hit
                                        pathColor.assign(pathColor.add(throughput.mul(lightColor)))
                                })

                                // Generate random direction for diffuse reflection
                                const r1 = hash(randomSeed.add(i.toUInt().mul(uint(2)).add(uint(10)))).toVar()
                                const r2 = hash(randomSeed.add(i.toUInt().mul(uint(2)).add(uint(11)))).toVar()

                                // Cosine-weighted hemisphere sampling
                                const theta = r1.mul(6.28318530718)
                                const cosTheta = r2.sqrt()
                                const sinTheta = cosTheta.mul(cosTheta).oneMinus().sqrt()

                                const localX = sinTheta.mul(theta.cos())
                                const localY = sinTheta.mul(theta.sin())
                                const localZ = cosTheta

                                // Transform to world space (simple hemisphere sampling)
                                const tangent = vec3(1, 0, 0).toVar()
                                If(normal.x.abs().greaterThan(0.9), () => {
                                        tangent.assign(vec3(0, 1, 0))
                                })
                                const bitangent = normal.cross(tangent).normalize()
                                tangent.assign(bitangent.cross(normal))

                                const newDir = tangent.mul(localX).add(bitangent.mul(localY)).add(normal.mul(localZ)).normalize()

                                // Update throughput with BRDF and PDF
                                // For Lambertian BRDF: material/PI
                                // For cosine-weighted sampling PDF: cos(theta)/PI
                                // Combined: material * cos(theta) / PDF = material * PI
                                throughput.assign(throughput.mul(material).mul(3.14159265))

                                // Russian roulette termination (only after 2 bounces)
                                If(i.greaterThan(2), () => {
                                        const p = throughput.x.max(throughput.y).max(throughput.z)
                                        If(p.lessThan(0.1), () => {
                                                Break()
                                        })
                                        If(hash(randomSeed.add(i.toUInt().mul(uint(100)))).greaterThan(p), () => {
                                                Break()
                                        })
                                        throughput.assign(throughput.div(p))
                                })

                                // Set up next ray (offset to avoid self-intersection)
                                currentOrigin.assign(hitPoint.add(normal.mul(0.001)))
                                currentDir.assign(newDir)
                        })
                })

                // Accumulate samples
                const currentPixel = pixelData.element(id.x).toVar()
                const newSampleCount = currentPixel.w.add(1)
                // const blendFactor = float(1).div(newSampleCount)

                const accumulatedColor = currentPixel.xyz.mul(currentPixel.w).add(pathColor).div(newSampleCount)

                pixelData.element(id.x).assign(vec4(accumulatedColor, newSampleCount))
        })

        // Fragment shader for visualization
        const fs = Fn(([uv]: [Vec2]) => {
                if (isWebGL) uv.y = uv.y.oneMinus()
                const x = uv.x.mul(w).toUInt()
                const y = uv.y.mul(h).toUInt()
                const idx = y.mul(uint(w)).add(x)
                const pixel = pixelData.element(idx)
                // Tone mapping and gamma correction
                const color = pixel.xyz.div(pixel.xyz.add(vec3(1, 1, 1))).pow(vec3(1.0 / 2.2, 1.0 / 2.2, 1.0 / 2.2))
                return vec4(color, 1)
        })

        let i = 0

        const gl = useGL({
                particleCount: [w, h],
                isWebGL,
                cs: cs(id),
                fs: fs(uv),
                mount() {
                        // Initialize pixel data
                        const initData = new Float32Array(pixels * 4)
                        for (let i = 0; i < pixels * 4; i++) initData[i] = 0
                        gl.storage(pixelData.props.id!, initData)
                },
                render() {
                        frameCount.value = i++
                },
        })

        return <canvas ref={gl.ref} />
}
