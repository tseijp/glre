import {
        float,
        Fn,
        fwidth,
        int,
        iResolution,
        Loop,
        select,
        smoothstep,
        uniform,
        uv,
        vec2,
        vec3,
        vec4,
} from 'glre/src/node'
import { useGL } from 'glre/src/react'

// Geometry pass - renders scene geometry to G-Buffer
const geometryPass = Fn(([uv]) => {
        // Simple sphere at center with varying surface properties
        const aspect = iResolution.x.div(iResolution.y).toVar('aspect')
        const center = vec2(0.5, 0.5).toVar('center')
        const correctedUV = vec2(uv.x.mul(aspect), uv.y).toVar('correctedUV')
        const correctedCenter = vec2(center.x.mul(aspect), center.y).toVar('correctedCenter')
        const dist = correctedUV.distance(correctedCenter).toVar('dist')
        const radius = float(0.3).mul(aspect).toVar('radius')

        // Anti-aliased sphere edge using fwidth
        const edge = fwidth(dist).toVar('edge')
        const isInside = smoothstep(radius.add(edge), radius.sub(edge), dist).toVar('isInside')

        // Calculate surface position (fake 3D sphere)
        const height = radius.mul(radius).sub(dist.mul(dist)).sqrt().toVar('height')
        const worldPos = vec3(uv.x.sub(0.5).mul(2.0), uv.y.sub(0.5).mul(2.0), height).toVar('worldPos')

        // Return G-Buffer data
        return vec4(
                worldPos.x.mul(isInside), // Position.x * mask
                worldPos.y.mul(isInside), // Position.y * mask
                worldPos.z.mul(isInside), // Position.z * mask
                isInside // Mask
        )
})

// Lighting pass - calculates lighting using G-Buffer data
const lightingPass = Fn(([uv]) => {
        // Sample G-Buffer (in real implementation this would be textures)
        const mask = geometryPass(uv).w.toVar('mask')

        // Reconstruct world position and normal
        const gData = geometryPass(uv).toVar('gData')
        const worldPos = gData.xyz.toVar('worldPos')
        const normal = worldPos.normalize().toVar('normal')

        // Base albedo
        const albedo = vec3(0.7, 0.4, 0.2).add(normal.mul(0.3)).toVar('albedo')

        // Ambient lighting
        const ambient = vec3(0.1, 0.1, 0.15).toVar('ambient')

        // Multiple point lights
        const totalLight = ambient.toVar('totalLight')

        Loop(int(4), ({ i }) => {
                // Light positions in a circle
                const angle = float(i).mul(1.57).toVar('angle') // 90 degrees apart
                const lightPos = vec3(angle.cos().mul(1.5), angle.sin().mul(1.5), 1.0).toVar('lightPos')

                // Light colors
                const lightColors = [
                        vec3(1.0, 0.3, 0.3), // Red
                        vec3(0.3, 1.0, 0.3), // Green
                        vec3(0.3, 0.3, 1.0), // Blue
                        vec3(1.0, 1.0, 0.3), // Yellow
                ]

                const lightColor = select(
                        lightColors[0],
                        select(
                                lightColors[1],
                                select(lightColors[2], lightColors[3], i.equal(int(2))),
                                i.equal(int(1))
                        ),
                        i.equal(int(0))
                ).toVar('lightColor')

                // Calculate lighting
                const lightDir = lightPos.sub(worldPos).normalize().toVar('lightDir')
                const distance = lightPos.distance(worldPos).toVar('distance')
                const attenuation = float(1.0).div(distance.mul(distance).mul(0.5).add(1.0)).toVar('attenuation')

                const NdotL = normal.dot(lightDir).clamp(0.0, 1.0).toVar('NdotL')
                const diffuse = lightColor.mul(NdotL).mul(attenuation).toVar('diffuse')

                totalLight.assign(totalLight.add(diffuse))
        })

        // Final color
        const finalColor = albedo.mul(totalLight).toVar('finalColor')

        // Mix background and lit surface based on geometry presence
        const backgroundColor = vec4(0.02, 0.02, 0.04, 1.0).toVar('backgroundColor')
        const litSurface = vec4(finalColor, 1.0).toVar('litSurface')
        const geometryMask = mask.toVar('geometryMask')

        return backgroundColor.mul(geometryMask.oneMinus()).add(litSurface.mul(geometryMask))
})

export default function DeferredShading() {
        const gl = useGL({
                fs: lightingPass(uv),
                error: (msg) => {
                        throw new Error(msg)
                },
        })

        return <canvas ref={gl.ref} width={600} height={400} />
}
