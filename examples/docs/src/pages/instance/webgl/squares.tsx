import { useGL } from 'glre/src/react'

const vertex = `#version 300 es
in vec4 instanceColors;
in vec2 positions;
in vec2 instancePositions;
out vec4 vColor;
void main() {
        gl_Position = vec4(positions + instancePositions, 0.0, 1.0);
        vColor = instanceColors;
}`

const fragment = `#version 300 es
precision mediump float;
out vec4 fragColor;
in vec4 vColor;
void main() {
        fragColor = vColor;
}`

export default function WebGLInstancing() {
        const numInstances = 100

        // Create instance data
        const instancePositions = []
        const instanceColors = []
        const gridSize = Math.ceil(Math.sqrt(numInstances))

        for (let i = 0; i < numInstances; i++) {
                const row = Math.floor(i / gridSize)
                const col = i % gridSize
                const x = (col * 2 + 1) / gridSize - 1
                const y = (row * 2 + 1) / gridSize - 1
                instancePositions.push(x, y)
                const hue = (i / numInstances) * 360
                const r = Math.sin((hue * Math.PI) / 180) * 0.5 + 0.5
                const g = Math.sin((hue * Math.PI) / 180 + 2) * 0.5 + 0.5
                const b = Math.sin((hue * Math.PI) / 180 + 4) * 0.5 + 0.5
                instanceColors.push(r, g, b, 1)
        }

        // Base quad vertices (vec2)
        const positions = [-0.05, -0.05, 0.05, -0.05, 0.05, 0.05, -0.05, -0.05, 0.05, 0.05, -0.05, 0.05]
        const gl = useGL({
                isWebGL: true,
                instance: numInstances,
                count: 6,
                vertex,
                fragment,
        })

        gl.attribute('positions', positions)
        gl.attribute('instancePositions', instancePositions)
        gl.attribute('instanceColors', instanceColors)

        return <canvas ref={gl.ref} width={800} height={600} />
}
