import { Fn, id, storage, uv, UVec3, Vec2, vec4, vec2, uniform, vec3, If, float, Float, Vec3, uint } from 'glre/src/node'
import { useGL, isServer } from 'glre/src/react'

const isWebGL = false

export default function RaytracingApp() {
        const [w, h] = isServer() ? [0, 0] : [window.innerWidth, window.innerHeight]
        const pixels = w * h

        // Storage for pixel colors
        const pixelData = storage(vec3(), 'pixelData')

        // Camera uniforms
        const cameraPos = uniform(vec3(0, 0, -3), 'cameraPos')
        const cameraDir = uniform(vec3(0, 0, 1), 'cameraDir')
        const cameraUp = uniform(vec3(0, 1, 0), 'cameraUp')
        const fov = uniform(60, 'fov')

        // Sphere data (position + radius packed)
        const sphere1 = vec4(0, 0, 0, 1)
        const sphere2 = vec4(-2.5, 0, 0, 1)
        const sphere3 = vec4(2.5, 0, 0, 1)
        const sphere4 = vec4(0, -101, 0, 100) // Ground sphere

        // Light
        const lightPos = vec3(3, 3, -3)

        // Compute shader for raytracing
        const cs = Fn(([id]: [UVec3]) => {
                const idx = id.x.toFloat().toVar('idx')
                const x = idx.mod(w).toVar('x')
                const y = idx.div(w).floor().toVar('y')

                // Normalized device coordinates (-1 to 1)
                const ndcX = x.div(w).mul(2).sub(1).toVar('ndcX')
                const ndcY = y.div(h).mul(2).sub(1).negate().toVar('ndcY')

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

                const raySphereIntersect = (origin: Vec3, dir: Vec3, sphereCenter: Vec3, radius: Float) => {
                        const oc = origin.sub(sphereCenter)
                        const a = dir.dot(dir)
                        const b = oc.dot(dir).mul(2)
                        const c = oc.dot(oc).sub(radius.pow(2))
                        const discriminant = b.pow(2).sub(a.mul(c).mul(4))

                        const t = discriminant.sqrt().negate().sub(b).div(a.mul(2))
                        return vec2(discriminant, t)
                }

                // Test intersections with spheres
                const result1 = raySphereIntersect(rayOrigin, rayDir, sphere1.xyz, sphere1.w).toVar('result1')
                const result2 = raySphereIntersect(rayOrigin, rayDir, sphere2.xyz, sphere2.w).toVar('result2')
                const result3 = raySphereIntersect(rayOrigin, rayDir, sphere3.xyz, sphere3.w).toVar('result3')
                const result4 = raySphereIntersect(rayOrigin, rayDir, sphere4.xyz, sphere4.w).toVar('result4')

                // Find closest intersection
                const color = vec3(0.1, 0.1, 0.2).toVar('color') // Background color
                const minT = float(1000).toVar('minT')
                const hitNormal = vec3(0, 0, 0).toVar('hitNormal')
                const hitPoint = vec3(0, 0, 0).toVar('hitPoint')
                const sphereColor = vec3(0, 0, 0).toVar('sphereColor')

                // Check sphere 1
                If(result1.x.greaterThan(0).and(result1.y.greaterThan(0)).and(result1.y.lessThan(minT)), () => {
                        minT.assign(result1.y)
                        hitPoint.assign(rayOrigin.add(rayDir.mul(result1.y)))
                        hitNormal.assign(hitPoint.sub(sphere1.xyz).normalize())
                        sphereColor.assign(vec3(1.0, 0.2, 0.2))
                })

                // Check sphere 2
                If(result2.x.greaterThan(0).and(result2.y.greaterThan(0)).and(result2.y.lessThan(minT)), () => {
                        minT.assign(result2.y)
                        hitPoint.assign(rayOrigin.add(rayDir.mul(result2.y)))
                        hitNormal.assign(hitPoint.sub(sphere2.xyz).normalize())
                        sphereColor.assign(vec3(0.2, 1.0, 0.2))
                })

                // Check sphere 3
                If(result3.x.greaterThan(0).and(result3.y.greaterThan(0)).and(result3.y.lessThan(minT)), () => {
                        minT.assign(result3.y)
                        hitPoint.assign(rayOrigin.add(rayDir.mul(result3.y)))
                        hitNormal.assign(hitPoint.sub(sphere3.xyz).normalize())
                        sphereColor.assign(vec3(0.2, 0.2, 1.0))
                })

                // Check ground sphere
                If(result4.x.greaterThan(0).and(result4.y.greaterThan(0)).and(result4.y.lessThan(minT)), () => {
                        minT.assign(result4.y)
                        hitPoint.assign(rayOrigin.add(rayDir.mul(result4.y)))
                        hitNormal.assign(hitPoint.sub(sphere4.xyz).normalize())
                        sphereColor.assign(vec3(0.8, 0.8, 0.8))
                })

                // Apply lighting if we hit something
                If(minT.lessThan(999), () => {
                        const lightDir = lightPos.sub(hitPoint).normalize().toVar('lightDir')

                        // Check for shadows
                        const shadowOrigin = hitPoint.add(hitNormal.mul(0.001))
                        const shadowResult1 = raySphereIntersect(shadowOrigin, lightDir, sphere1.xyz, sphere1.w)
                        const shadowResult2 = raySphereIntersect(shadowOrigin, lightDir, sphere2.xyz, sphere2.w)
                        const shadowResult3 = raySphereIntersect(shadowOrigin, lightDir, sphere3.xyz, sphere3.w)
                        const shadowResult4 = raySphereIntersect(shadowOrigin, lightDir, sphere4.xyz, sphere4.w)

                        const lightDistance = lightPos.sub(hitPoint).length()
                        const inShadow = float(0).toVar()

                        If(shadowResult1.x.greaterThan(0).and(shadowResult1.y.greaterThan(0)).and(shadowResult1.y.lessThan(lightDistance)), () => {
                                inShadow.assign(1)
                        })
                        If(shadowResult2.x.greaterThan(0).and(shadowResult2.y.greaterThan(0)).and(shadowResult2.y.lessThan(lightDistance)), () => {
                                inShadow.assign(1)
                        })
                        If(shadowResult3.x.greaterThan(0).and(shadowResult3.y.greaterThan(0)).and(shadowResult3.y.lessThan(lightDistance)), () => {
                                inShadow.assign(1)
                        })
                        If(shadowResult4.x.greaterThan(0).and(shadowResult4.y.greaterThan(0)).and(shadowResult4.y.lessThan(lightDistance)), () => {
                                inShadow.assign(1)
                        })

                        const diffuse = hitNormal.dot(lightDir).max(0).mul(inShadow.oneMinus()).toVar('diffuse')

                        // Simple reflection
                        const reflectDir = rayDir.sub(hitNormal.mul(rayDir.dot(hitNormal).mul(2))).normalize()
                        const reflectOrigin = hitPoint.add(hitNormal.mul(0.001))

                        // Test reflection ray against other spheres
                        const reflResult1 = raySphereIntersect(reflectOrigin, reflectDir, sphere1.xyz, sphere1.w)
                        const reflResult2 = raySphereIntersect(reflectOrigin, reflectDir, sphere2.xyz, sphere2.w)
                        const reflResult3 = raySphereIntersect(reflectOrigin, reflectDir, sphere3.xyz, sphere3.w)
                        const reflResult4 = raySphereIntersect(reflectOrigin, reflectDir, sphere4.xyz, sphere4.w)

                        const reflMinT = float(1000).toVar()
                        const reflColor = vec3(0.1, 0.1, 0.2).toVar() // Sky color

                        If(reflResult1.x.greaterThan(0).and(reflResult1.y.greaterThan(0)).and(reflResult1.y.lessThan(reflMinT)), () => {
                                reflMinT.assign(reflResult1.y)
                                reflColor.assign(vec3(1.0, 0.2, 0.2))
                        })
                        If(reflResult2.x.greaterThan(0).and(reflResult2.y.greaterThan(0)).and(reflResult2.y.lessThan(reflMinT)), () => {
                                reflMinT.assign(reflResult2.y)
                                reflColor.assign(vec3(0.2, 1.0, 0.2))
                        })
                        If(reflResult3.x.greaterThan(0).and(reflResult3.y.greaterThan(0)).and(reflResult3.y.lessThan(reflMinT)), () => {
                                reflMinT.assign(reflResult3.y)
                                reflColor.assign(vec3(0.2, 0.2, 1.0))
                        })
                        If(reflResult4.x.greaterThan(0).and(reflResult4.y.greaterThan(0)).and(reflResult4.y.lessThan(reflMinT)), () => {
                                reflMinT.assign(reflResult4.y)
                                reflColor.assign(vec3(0.8, 0.8, 0.8))
                        })

                        const ambient = float(0.1).toVar('ambient')
                        const reflection = float(0.1).toVar('reflection') // Reflection strength

                        const finalColor = sphereColor.mul(diffuse.add(ambient)).add(reflColor.mul(reflection))
                        color.assign(finalColor)
                })

                pixelData.element(id.x).assign(color)
        })

        // Fragment shader for visualization
        const fs = Fn(([uv]: [Vec2]) => {
                if (isWebGL) uv.y = uv.y.oneMinus()
                const x = uv.x.mul(w).toUInt()
                const y = uv.y.mul(h).toUInt()
                const idx = y.mul(uint(w)).add(x)
                const color = pixelData.element(idx)
                return vec4(color, 1)
        })

        const gl = useGL({
                particleCount: [w, h],
                isWebGL,
                isDebug: true,
                cs: cs(id),
                fs: fs(uv),
                mount() {
                        // Initialize pixel data
                        const initData = new Float32Array(pixels * 4)
                        for (let i = 0; i < pixels * 4; i++) {
                                initData[i] = 0.1 // Dark blue background
                        }
                        gl.storage(pixelData.props.id!, initData)
                },
        })

        return <canvas ref={gl.ref} />
}
