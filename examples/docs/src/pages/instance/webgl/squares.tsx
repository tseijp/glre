import Layout from '@theme/Layout'
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
        const instanceCount = 100

        // Create instance data
        const instancePositions = []
        const instanceColors = []
        const gridSize = Math.ceil(Math.sqrt(instanceCount))

        for (let i = 0; i < instanceCount; i++) {
                const row = Math.floor(i / gridSize)
                const col = i % gridSize
                const x = (col * 2 + 1) / gridSize - 1
                const y = (row * 2 + 1) / gridSize - 1
                instancePositions.push(x, y)
                const hue = (i / instanceCount) * 360
                const r = Math.sin((hue * Math.PI) / 180) * 0.5 + 0.5
                const g = Math.sin((hue * Math.PI) / 180 + 2) * 0.5 + 0.5
                const b = Math.sin((hue * Math.PI) / 180 + 4) * 0.5 + 0.5
                instanceColors.push(r, g, b, 1)
        }

        // Base quad vertices (vec2)
        const positions = [-0.05, -0.05, 0.05, -0.05, 0.05, 0.05, -0.05, -0.05, 0.05, 0.05, -0.05, 0.05]
        const gl = useGL({
                isWebGL: true,
                instanceCount,
                triangleCount: 2,
                vertex,
                fragment,
        })

        gl.attribute('positions', positions)
        gl.instance('instancePositions', instancePositions)
        gl.instance('instanceColors', instanceColors)

        return (
                <Layout noFooter>
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', touchAction: 'none' }}>
                                <canvas ref={gl.ref} />
                        </div>
                </Layout>
        )
}
