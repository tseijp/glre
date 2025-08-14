import { useGL } from 'glre/src/react'

const vertex = `
struct In {
        @location(0) positions: vec2f,
        @location(1) instancePositions: vec2f,
        @location(2) instanceColors: vec4f
}
struct Out {
        @builtin(position) position: vec4f,
        @location(0) vColor: vec4f
}
@vertex
fn main(in: In) -> Out {
        var out: Out;
        out.position = vec4f(in.positions + in.instancePositions, 0.0, 1.0);
        out.vColor = in.instanceColors;
        return out;
}`

const fragment = `
struct Out {
        @builtin(position) position: vec4f,
        @location(0) vColor: vec4f
}
@fragment
fn main(out: Out) -> @location(0) vec4f {
        return out.vColor;
}`

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
                isWebGL: false,
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
