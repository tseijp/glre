// @ts-ignore
import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { attribute, instance, vec4, vertexStage } from 'glre/src/node'

export default function WebGLInstancing() {
        const instanceCount = 100

        const instancePositions = []
        const instanceColors = []
        const positions = [-0.05, -0.05, 0.05, -0.05, 0.05, 0.05, -0.05, -0.05, 0.05, 0.05, -0.05, 0.05]
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

        const box = attribute<'vec2'>(positions)
        const pos = instance<'vec2'>(instancePositions)
        const col = instance<'vec4'>(instanceColors)

        const gl = useGL({
                isWebGL: true,
                instanceCount,
                count: 6,
                vert: vec4(box.add(pos), 0, 1),
                frag: vertexStage(col),
        })

        return (
                <Layout noFooter>
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', touchAction: 'none' }}>
                                <canvas ref={gl.ref} />
                        </div>
                </Layout>
        )
}
