import { useGL } from 'glre/src/react'
import { attribute, vec2, vec3, vec4, vertexStage } from 'glre/src/node'

export default function WebGLInstancing() {
        const numInstances = 100

        // Create instance position data - arranged in a grid
        const instancePositions = []
        const instanceColors = []
        const gridSize = Math.ceil(Math.sqrt(numInstances))

        for (let i = 0; i < numInstances; i++) {
                const row = Math.floor(i / gridSize)
                const col = i % gridSize
                const x = (col * 2 + 1) / gridSize - 1
                const y = (row * 2 + 1) / gridSize - 1

                // Position (vec3)
                instancePositions.push(x, y, 0)

                // Color based on position (vec3)
                const hue = (i / numInstances) * 360
                const r = Math.sin((hue * Math.PI) / 180) * 0.5 + 0.5
                const g = Math.sin((hue * Math.PI) / 180 + 2) * 0.5 + 0.5
                const b = Math.sin((hue * Math.PI) / 180 + 4) * 0.5 + 0.5
                instanceColors.push(r, g, b, 1)
        }

        // Base quad vertices
        // prettier-ignore
        const positions = [
                -0.05, -0.05, 0.0,
                0.05, -0.05, 0.0,
                0.05, 0.05, 0.0,
                -0.05, -0.05, 0.0,
                0.05, 0.05, 0.0,
                -0.05, 0.05, 0.0,
        ]

        const a_position = attribute<'vec3'>(positions, 'positions')
        const a_instancePositions = attribute(vec2(instancePositions), 'instancePositions')
        const a_instanceColors = attribute(vec4(instanceColors), 'instanceColors')

        const gl = useGL({
                isWebGL: true,
                instance: numInstances,
                count: 6,
                vert: vec4(a_position.add(vec3(a_instancePositions, 0)), 1),
                frag: vertexStage(a_instanceColors),
        })

        return <canvas ref={gl.ref} width={800} height={600} />
}
