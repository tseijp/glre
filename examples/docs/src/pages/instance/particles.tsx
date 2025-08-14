import { useGL } from 'glre/src/react'
import { attribute, vec2, vec3, vec4, Vec2, uv, builtin, storage, id, If, Fn, distance, length } from 'glre/src/node'

export default function ParticleInstancing() {
        const particleCount = 1024

        // Storage for particle data - same as original demo
        const positions = storage(vec2(), 'positions')
        const velocities = storage(vec2(), 'velocities')

        // Compute shader - same physics as original
        const compute = Fn(([globalId]: [typeof id]) => {
                const index = globalId.x
                const pos = positions.element(index).toVar('pos')
                const vel = velocities.element(index).toVar('vel')

                // Update position
                pos.assign(pos.add(vel.mul(0.01)))

                // Bounce off edges
                const isReverseX = pos.x.lessThan(0.0).or(pos.x.greaterThan(1.0))
                const isReverseY = pos.y.lessThan(0.0).or(pos.y.greaterThan(1.0))

                If(isReverseX, () => {
                        vel.x.assign(vel.x.mul(-1.0))
                        pos.x.assign(pos.x.clamp(0.0, 1.0))
                })
                If(isReverseY, () => {
                        vel.y.assign(vel.y.mul(-1.0))
                        pos.y.assign(pos.y.clamp(0.0, 1.0))
                })

                positions.element(index).assign(pos)
                velocities.element(index).assign(vel)
        })

        // Small circle vertices for each particle instance
        const circleVertices = []
        const segments = 6
        for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2
                const nextAngle = ((i + 1) / segments) * Math.PI * 2

                // Triangle fan from center
                circleVertices.push(0, 0) // center
                circleVertices.push(Math.cos(angle) * 0.01, Math.sin(angle) * 0.01)
                circleVertices.push(Math.cos(nextAngle) * 0.01, Math.sin(nextAngle) * 0.01)
        }

        const a_position = attribute(circleVertices, 'positions')
        const instanceIndex = builtin('instance_index')

        const gl = useGL({
                particles: particleCount,
                isWebGL: false,
                instance: particleCount, // Draw each particle as instance
                count: circleVertices.length / 2,
                cs: compute(id),
                vert: vec4(a_position.add(positions.element(instanceIndex).mul(2).sub(1) as unknown as Vec2), 0, 1),
                frag: vec4(vec3(0.3, 0.2, 0.2), 1),
        })

        // Initialize particle data - same as original
        const positionsData = new Float32Array(particleCount * 2)
        const velocitiesData = new Float32Array(particleCount * 2)

        for (let i = 0; i < particleCount; i++) {
                positionsData[i * 2] = Math.random()
                positionsData[i * 2 + 1] = Math.random()
                velocitiesData[i * 2] = (Math.random() - 0.5) * 0.5
                velocitiesData[i * 2 + 1] = (Math.random() - 0.5) * 0.5
        }

        gl.storage('positions', positionsData)
        gl.storage('velocities', velocitiesData)

        return <canvas ref={gl.ref} width={800} height={600} />
}
