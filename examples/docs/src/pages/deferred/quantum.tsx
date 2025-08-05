import {
        cos,
        exp,
        float,
        Fn,
        fwidth,
        int,
        iResolution,
        iTime,
        Loop,
        select,
        sin,
        smoothstep,
        sqrt,
        uniform,
        uv,
        vec2,
        vec3,
        vec4,
} from 'glre/src/node'
import { useGL } from 'glre/src/react'
import { useControls } from 'leva'

// Quantum Interference Deferred Shading Demo
// G-Buffer stores: wave amplitudes, phase information, interference patterns

// Quantum wave parameters
const quantumSpeed = uniform(float(), 'quantumSpeed')

// Geometry pass - quantum wave function calculation
const quantumGeometry = Fn(([uv]) => {
        const time = iTime.mul(quantumSpeed).toVar('time')
        const center = uv.sub(0.5).toVar('center')

        // Multiple quantum wave sources
        const totalAmplitude = float(0.0).toVar('totalAmplitude')
        const totalPhase = float(0.0).toVar('totalPhase')

        Loop(int(8), ({ i }) => {
                // Wave source positions (double-slit experiment inspired)
                const sourceIndex = float(i).toVar('sourceIndex')
                const angle = sourceIndex.mul(0.785).toVar('angle') // 45 degrees apart
                const sourceDistance = float(0.3).toVar('sourceDistance')
                const sourcePos = vec2(angle.cos().mul(sourceDistance), angle.sin().mul(sourceDistance)).toVar(
                        'sourcePos'
                )

                // Distance from wave source
                const waveDistance = center.distance(sourcePos).toVar('waveDistance')

                // Quantum wave equation: ψ = A * e^(i(kx - ωt))
                const wavelength = float(0.1).toVar('wavelength')
                const frequency = float(2.0).toVar('frequency')
                const k = float(6.28318).div(wavelength).toVar('k') // wave number
                const omega = frequency.mul(6.28318).toVar('omega') // angular frequency

                // Phase calculation
                const phase = k.mul(waveDistance).sub(omega.mul(time)).toVar('phase')

                // Amplitude with decay
                const amplitude = float(1.0).div(waveDistance.add(1.0)).toVar('amplitude')

                // Wave function (real and imaginary parts)
                const realPart = amplitude.mul(cos(phase)).toVar('realPart')
                const imagPart = amplitude.mul(sin(phase)).toVar('imagPart')

                // Superposition principle
                totalAmplitude.assign(totalAmplitude.add(sqrt(realPart.mul(realPart).add(imagPart.mul(imagPart)))))
                totalPhase.assign(totalPhase.add(phase))
        })

        // Probability density |ψ|²
        const probability = totalAmplitude.mul(totalAmplitude).toVar('probability')

        // Coherence effects
        const coherence = sin(totalPhase).mul(0.5).add(0.5).toVar('coherence')
        const coherentProbability = probability.mul(coherence).toVar('coherentProbability')

        // Anti-aliased quantum field visualization
        const fieldThreshold = float(0.2).toVar('fieldThreshold')
        const edge = fwidth(coherentProbability).toVar('edge')
        const quantumMask = smoothstep(fieldThreshold.sub(edge), fieldThreshold.add(edge), coherentProbability).toVar(
                'quantumMask'
        )

        // Store quantum state in G-Buffer
        return vec4(
                totalAmplitude, // Wave amplitude
                totalPhase, // Phase information
                coherentProbability, // Probability density
                quantumMask // Quantum field mask
        )
})

// Lighting pass - quantum interference visualization
const quantumLighting = Fn(([uv]) => {
        const gData = quantumGeometry(uv).toVar('gData')
        const amplitude = gData.x.toVar('amplitude')
        const phase = gData.y.toVar('phase')
        const probability = gData.z.toVar('probability')
        const mask = gData.w.toVar('mask')

        // Quantum tunneling effects
        const tunnelingField = float(0.0).toVar('tunnelingField')

        Loop(int(12), ({ i }) => {
                const sampledIndex = float(i).toVar('sampledIndex')
                const sampleAngle = sampledIndex.mul(0.524).toVar('sampleAngle') // 30 degrees
                const sampleRadius = float(0.15).toVar('sampleRadius')
                const sampleOffset = vec2(
                        sampleAngle.cos().mul(sampleRadius),
                        sampleAngle.sin().mul(sampleRadius)
                ).toVar('sampleOffset')
                const samplePos = uv.add(sampleOffset).toVar('samplePos')

                // Sample neighboring quantum field
                const neighborData = quantumGeometry(samplePos).toVar('neighborData')
                const neighborProbability = neighborData.z.toVar('neighborProbability')

                // Quantum tunneling probability
                const barrier = sampleOffset.length().toVar('barrier')
                const tunnelingProb = neighborProbability.mul(exp(barrier.mul(5.0).negate())).toVar('tunnelingProb')
                tunnelingField.assign(tunnelingField.add(tunnelingProb))
        })

        // Color mapping based on quantum properties
        const phaseColor = vec3(
                sin(phase).mul(0.5).add(0.5), // Red based on phase
                amplitude.mul(0.7), // Green based on amplitude
                probability.mul(1.2) // Blue based on probability
        ).toVar('phaseColor')

        // Interference pattern colors
        const constructive = vec3(0.9, 0.1, 0.9).toVar('constructive') // Magenta for constructive
        const destructive = vec3(0.1, 0.9, 0.9).toVar('destructive') // Cyan for destructive
        const interferenceRatio = cos(phase).mul(0.5).add(0.5).toVar('interferenceRatio')
        const interferenceColor = constructive
                .mul(interferenceRatio)
                .add(destructive.mul(interferenceRatio.oneMinus()))
                .toVar('interferenceColor')

        // Tunneling visualization
        const tunnelingColor = vec3(1.0, 0.8, 0.2).mul(tunnelingField.mul(0.3)).toVar('tunnelingColor')

        // Final quantum color composition
        const quantumColor = phaseColor
                .mul(0.4)
                .add(interferenceColor.mul(0.4))
                .add(tunnelingColor)
                .toVar('quantumColor')

        // Background (vacuum state)
        const vacuumColor = vec4(0.02, 0.05, 0.1, 1.0).toVar('vacuumColor')
        const quantumSurface = vec4(quantumColor, 1.0).toVar('quantumSurface')

        return vacuumColor.mul(mask.oneMinus()).add(quantumSurface.mul(mask))
})

export default function QuantumDeferred() {
        const gl = useGL({
                fs: quantumLighting(uv),
                error: (msg) => {
                        throw new Error(msg)
                },
        })

        // Set quantum parameters
        gl.uniform(
                useControls({
                        quantumSpeed: 0.8,
                })
        )

        return <canvas ref={gl.ref} width={800} height={600} />
}
