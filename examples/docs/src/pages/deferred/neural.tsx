import {
        exp,
        float,
        Fn,
        fwidth,
        int,
        iTime,
        Loop,
        max,
        min,
        smoothstep,
        step,
        uniform,
        uv,
        vec2,
        vec3,
        vec4,
} from 'glre/src/node'
import { useGL } from 'glre/src/react'
import { useControls } from 'leva'

// Time Paradox Deferred Shading Demo
// G-Buffer stores: temporal distortion, causality loops, timeline fractures, chronon density

// Time manipulation parameters
const timeDistortion = uniform(float(), 'timeDistortion')
const causalityStrength = uniform(float(), 'causalityStrength')
const temporalDecay = uniform(float(), 'temporalDecay')
const paradoxIntensity = uniform(float(), 'paradoxIntensity')

// Hash function for temporal chaos patterns
const timeHash = Fn(([coord, timeLayer]) => {
        const x = coord.x.add(timeLayer.mul(0.13)).toVar('x')
        const y = coord.y.add(timeLayer.mul(0.19)).toVar('y')
        const dotResult = vec2(173.7, 263.1).dot(vec2(x, y)).toVar('dotResult')
        return dotResult.sin().mul(47853.5471).fract().toVar('hashResult')
})

// Geometry pass - temporal distortion field calculation
const temporalGeometry = Fn(([uv]) => {
        const baseTime = iTime.toVar('baseTime')
        const center = uv.sub(0.5).toVar('center')

        // Multiple timeline layers (past, present, future intersections)
        const distortionField = float(0.0).toVar('distortionField')
        const causalityField = float(0.0).toVar('causalityField')
        const fractures = float(0.0).toVar('fractures')

        Loop(int(10), ({ i }) => {
                // Timeline layers with different temporal speeds
                const timelineIndex = float(i).toVar('timelineIndex')
                const timelineSpeed = timelineIndex.mul(0.3).add(0.5).toVar('timelineSpeed')
                const layerTime = baseTime.mul(timelineSpeed).toVar('layerTime')

                // Temporal vortex positions (creating time rifts)
                const vortexAngle = timelineIndex.mul(2.5).add(layerTime.mul(0.2)).toVar('vortexAngle')
                const vortexRadius = timelineIndex.div(10.0).mul(0.35).add(0.15).toVar('vortexRadius')
                const vortexPos = vec2(vortexAngle.cos().mul(vortexRadius), vortexAngle.sin().mul(vortexRadius)).toVar(
                        'vortexPos'
                )

                // Distance to temporal vortex
                const distToVortex = center.distance(vortexPos).toVar('distToVortex')

                // Time distortion field (gravity-like effects)
                const distortionStrength = timeDistortion.div(distToVortex.add(0.05)).toVar('distortionStrength')
                const temporalWave = layerTime.mul(3.0).add(timelineIndex.mul(1.4)).sin().toVar('temporalWave')
                const localDistortion = distortionStrength.mul(temporalWave.mul(0.5).add(0.5)).toVar('localDistortion')

                // Causality loops (events affecting their own past)
                const futureTime = layerTime.add(timelineIndex.mul(0.8)).toVar('futureTime')
                const pastTime = layerTime.sub(timelineIndex.mul(0.6)).toVar('pastTime')
                const causalLoop = timeHash(vortexPos.mul(8.0), futureTime).toVar('futureEvent')
                const pastInfluence = timeHash(vortexPos.mul(8.0), pastTime).toVar('pastInfluence')
                const causalityLink = causalLoop.mul(pastInfluence).mul(causalityStrength).toVar('causalityLink')

                // Timeline fractures (paradox points)
                const paradoxThreshold = float(0.7).toVar('paradoxThreshold')
                const exceedsThreshold = step(paradoxThreshold, causalityLink).toVar('exceedsThreshold')
                const fractureIntensity = exceedsThreshold
                        .mul(paradoxIntensity)
                        .mul(distortionStrength)
                        .toVar('fractureIntensity')

                // Temporal decay (events fading from timeline)
                const ageDecay = exp(timelineIndex.mul(temporalDecay).negate()).toVar('ageDecay')

                // Accumulate temporal effects
                distortionField.assign(distortionField.add(localDistortion.mul(ageDecay)))
                causalityField.assign(causalityField.add(causalityLink.mul(ageDecay)))
                fractures.assign(fractures.add(fractureIntensity))
        })

        // Chronon density (time particle concentration)
        const chrononDensity = distortionField.mul(causalityField).add(fractures).toVar('chrononDensity')
        const normalizedDensity = min(chrononDensity, 1.0).toVar('normalizedDensity')

        // Temporal field mask with chaotic boundaries
        const chaosNoise = timeHash(uv.mul(25.0), baseTime.mul(0.7)).toVar('chaosNoise')
        const temporalThreshold = float(0.25).add(chaosNoise.mul(0.3)).toVar('temporalThreshold')
        const edge = fwidth(normalizedDensity).toVar('edge')
        const temporalMask = smoothstep(
                temporalThreshold.sub(edge),
                temporalThreshold.add(edge),
                normalizedDensity
        ).toVar('temporalMask')

        // Store temporal state in G-Buffer
        return vec4(
                distortionField.mul(temporalMask), // Temporal distortion
                causalityField.mul(temporalMask), // Causality loops
                fractures.mul(temporalMask), // Timeline fractures
                temporalMask // Temporal field mask
        )
})

// Lighting pass - temporal visualization
const temporalLighting = Fn(([uv]) => {
        const gData = temporalGeometry(uv).toVar('gData')
        const distortion = gData.x.toVar('distortion')
        const causality = gData.y.toVar('causality')
        const fractures = gData.z.toVar('fractures')

        // If no mask, show a test pattern
        const testPattern = vec3(uv.x, uv.y, iTime.mul(0.5).sin().mul(0.5).add(0.5)).toVar('testPattern')

        // Temporal field interactions (time ripples)
        const timeRipples = float(0.0).toVar('timeRipples')
        const paradoxField = float(0.0).toVar('paradoxField')

        Loop(int(14), ({ i }) => {
                // Sample temporal field in multiple directions and times
                const sampleIndex = float(i).toVar('sampleIndex')
                const sampleAngle = sampleIndex.mul(0.449).toVar('sampleAngle') // 25.7 degrees
                const sampleDist = float(0.06).add(sampleIndex.div(14.0).mul(0.1)).toVar('sampleDist')
                const sampleOffset = vec2(sampleAngle.cos().mul(sampleDist), sampleAngle.sin().mul(sampleDist)).toVar(
                        'sampleOffset'
                )
                const samplePos = uv.add(sampleOffset).toVar('samplePos')

                // Sample neighboring temporal field
                const neighborData = temporalGeometry(samplePos).toVar('neighborData')
                const neighborDistortion = neighborData.x.toVar('neighborDistortion')
                const neighborCausality = neighborData.y.toVar('neighborCausality')
                const neighborFractures = neighborData.z.toVar('neighborFractures')

                // Time ripple propagation
                const rippleStrength = neighborDistortion.div(sampleDist.add(1.0)).toVar('rippleStrength')
                timeRipples.assign(timeRipples.add(rippleStrength))

                // Paradox field (causality violations creating instability)
                const causalityConflict = causality.mul(neighborCausality).toVar('causalityConflict')
                const paradox = causalityConflict.mul(neighborFractures).div(sampleDist.add(1.0)).toVar('paradox')
                paradoxField.assign(paradoxField.add(paradox))
        })

        // Color mapping for different temporal states
        const distortionColor = vec3(0.2, 0.7, 1.0).toVar('distortionColor') // Cyan for time distortion
        const causalityColor = vec3(1.0, 0.4, 0.2).toVar('causalityColor') // Orange for causality loops
        const fractureColor = vec3(1.0, 0.1, 0.8).toVar('fractureColor') // Magenta for fractures
        const paradoxColor = vec3(0.9, 0.9, 0.1).toVar('paradoxColor') // Yellow for paradoxes

        // Temporal state mixing (amplify values for visibility)
        const amplificationFactor = float(10.0).toVar('amplificationFactor')
        const temporalState = distortionColor
                .mul(distortion.mul(amplificationFactor))
                .add(causalityColor.mul(causality.mul(amplificationFactor)))
                .add(fractureColor.mul(fractures.mul(amplificationFactor)))
                .add(paradoxColor.mul(paradoxField.mul(0.5)))
                .toVar('temporalState')

        // Time ripple visualization (wave interference patterns)
        const rippleVisualization = vec3(0.7, 0.3, 0.9).mul(timeRipples.mul(2.0)).toVar('rippleVisualization')

        // Temporal instability effect (random flashes at high paradox levels)
        const instabilityThreshold = float(0.1).toVar('instabilityThreshold') // Lower threshold
        const timeNoise = timeHash(uv.mul(50.0), iTime.mul(5.0)).toVar('timeNoise')
        const instabilityMask = step(instabilityThreshold, paradoxField).toVar('instabilityMask')
        const flashIntensity = timeNoise.mul(0.4).toVar('flashIntensity')
        const instabilityFlash = vec3(1.0, 1.0, 1.0).mul(flashIntensity).mul(instabilityMask).toVar('instabilityFlash')

        // Chronon particle effects (visible time particles)
        const chrononEffect = vec3(0.5, 0.8, 0.3).mul(distortion.mul(causality).mul(3.0)).toVar('chrononEffect')

        // Final temporal visualization
        const finalTemporal = temporalState
                .add(rippleVisualization)
                .add(instabilityFlash)
                .add(chrononEffect)
                .toVar('finalTemporal')

        // Always show something - either temporal effects or test pattern
        const visibleColor = max(finalTemporal, testPattern.mul(0.1)).toVar('visibleColor')

        // Background (normal spacetime)
        const spacetimeColor = vec4(0.05, 0.08, 0.12, 1.0).toVar('spacetimeColor') // Brighter background
        const temporalAnomaly = vec4(visibleColor, 1.0).toVar('temporalAnomaly')

        return spacetimeColor.add(temporalAnomaly.mul(0.8)) // Always show something
})

export default function TimeParadoxDeferred() {
        const gl = useGL({
                fs: temporalLighting(uv),
                error: (msg) => {
                        throw new Error(msg)
                },
        })

        gl.uniform(
                useControls({
                        timeDistortion: 1.5,
                        causalityStrength: 0.5,
                        temporalDecay: 1,
                        paradoxIntensity: 1,
                })
        )

        return <canvas ref={gl.ref} width={800} height={600} />
}
