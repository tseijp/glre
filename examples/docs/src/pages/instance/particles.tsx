// @ts-ignore
import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { attribute, instance, uniform, vec4, If, Fn, vertexStage } from 'glre/src/node'

export default function ParticleSystem() {
        const gridSize = 100
        const instanceCount = gridSize * gridSize

        let particlePositions: number[] = []
        let particleVelocities: number[] = []
        let isMouseDown = false
        let mousePos = [0, 0]

        const initializeParticles = () => {
                const positions = []
                const velocities = []
                const step = 2.0 / gridSize
                for (let i = 0; i < gridSize; i++) {
                        for (let j = 0; j < gridSize; j++) {
                                const x = -1.0 + step * (i + 0.5)
                                const y = -1.0 + step * (j + 0.5)
                                positions.push(x, y)
                                velocities.push(0, 0)
                        }
                }
                particlePositions = positions
                particleVelocities = velocities
                return positions
        }

        const updateParticles = () => {
                const damping = 0.98
                const attraction = 0.001

                for (let i = 0; i < instanceCount; i++) {
                        const idx = i * 2
                        const px = particlePositions[idx]
                        const py = particlePositions[idx + 1]
                        let vx = particleVelocities[idx]
                        let vy = particleVelocities[idx + 1]

                        if (isMouseDown) {
                                const dx = mousePos[0] - px
                                const dy = mousePos[1] - py
                                const dist = Math.sqrt(dx * dx + dy * dy)
                                if (dist > 0.001) {
                                        vx += (dx / dist) * attraction
                                        vy += (dy / dist) * attraction
                                }
                        }

                        vx *= damping
                        vy *= damping

                        particlePositions[idx] += vx
                        particlePositions[idx + 1] += vy
                        particleVelocities[idx] = vx
                        particleVelocities[idx + 1] = vy
                }
        }

        const positions = [-0.002, -0.002, 0.002, -0.002, 0.002, 0.002, -0.002, -0.002, 0.002, 0.002, -0.002, 0.002]
        const pos = instance<'vec2'>(initializeParticles())
        const point = attribute<'vec2'>(positions)
        const mouseUniform = uniform<'vec2'>(mousePos, 'mousePos')
        const mouseDownUniform = uniform<'float'>(1, 'mouseDown')

        const gl = useGL({
                isWebGL: true,
                instanceCount,
                count: 6,
                mount() {
                        const canvas = gl.el
                        const handleMouseMove = (e: MouseEvent) => {
                                const rect = canvas.getBoundingClientRect()
                                const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
                                const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
                                mousePos = [x, y]
                        }
                        const handleMouseDown = () => {
                                isMouseDown = true
                        }
                        const handleMouseUp = () => {
                                isMouseDown = false
                        }
                        canvas.addEventListener('mousemove', handleMouseMove)
                        canvas.addEventListener('mousedown', handleMouseDown)
                        canvas.addEventListener('mouseup', handleMouseUp)
                        canvas.style.cursor = 'crosshair'
                },
                // clean() {
                //         {
                //                 canvas.removeEventListener('mousemove', handleMouseMove)
                //                 canvas.removeEventListener('mousedown', handleMouseDown)
                //                 canvas.removeEventListener('mouseup', handleMouseUp)
                //         }
                // },
                render() {
                        updateParticles()
                        pos.value = particlePositions
                        mouseUniform.value = mousePos
                        mouseDownUniform.value = isMouseDown ? 1.0 : 0.0
                },
                vert: vec4(pos.add(point), 0, 1),
                frag: Fn(() => {
                        const dist = vertexStage(pos).sub(mouseUniform).length()
                        const intensity = dist.mul(5.0).saturate()
                        If(mouseDownUniform.greaterThan(0.5), () => {
                                return vec4(intensity.oneMinus(), intensity, 1.0, 1.0)
                        })
                        return vec4(1.0, 1.0, 1.0, 1.0)
                })(),
        })

        return (
                <Layout noFooter>
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
                                <canvas ref={gl.ref} />
                        </div>
                </Layout>
        )
}
