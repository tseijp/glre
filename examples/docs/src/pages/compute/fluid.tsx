import { Fn, float, Float, id, If, storage, uniform, uv, UVec3, vec2, vec3, vec4, Vec2 } from 'glre/src/node'
import { useGL, isServer } from 'glre/src/react'
import { useDrag } from 'rege/react'

export default function FluidSimulationApp() {
        const [w, h] = isServer() ? [256, 256] : [window.innerWidth, window.innerHeight]
        const particles = w * h

        // Storage buffers for fluid simulation
        const velocityField = storage(vec2(), 'velocity')
        const pressureField = storage(float(), 'pressure')

        // Uniforms for simulation control
        const mousePos = uniform<'vec2'>([0, 0])
        const mousePrev = uniform<'vec2'>([0, 0])
        const isDragging = uniform<'float'>(float(0))
        const forceRadius = uniform<'float'>(0.1)
        const forceStrength = uniform<'float'>(100.0)

        // Helper functions
        const indexToUV = (idx: Float) => vec2(idx.mod(w), idx.div(w).floor()).div(vec2(w, h))
        const uvToIndex = (uv: Vec2) => uv.y.mul(h).floor().mul(w).add(uv.x.mul(w).floor())
        const getVelocity = (uv: Vec2) => {
                const clampedUV = uv.clamp(vec2(0.001), vec2(0.999))
                return velocityField.element(uvToIndex(clampedUV).toUInt()) as unknown as Vec2
        }
        const getPressure = (uv: Vec2) => {
                const clampedUV = uv.clamp(vec2(0), vec2(1))
                return pressureField.element(uvToIndex(clampedUV).toUInt()) as unknown as Float
        }

        const cs = Fn(([id]: [UVec3]) => {
                const idx = id.x.toFloat()
                const uv = indexToUV(idx)
                const pixelSize = vec2(1.0 / w, 1.0 / h)

                // Current velocity
                const currentVel = velocityField.element(id.x) as unknown as Vec2

                // Advection (Semi-Lagrangian method)
                const prevUV = uv.sub(currentVel.mul(0.01))
                const advectedVel = getVelocity(prevUV).mul(0.99) // Add slight damping

                // External Forces (Mouse input)
                let newVel = advectedVel.toVar()
                If(isDragging.greaterThan(0), () => {
                        const dist = uv.sub(mousePos).length()
                        const forceFactor = float(1).sub(dist.div(forceRadius)).clamp(0, 1).pow(2)
                        const mouseVel = mousePos.sub(mousePrev).mul(forceStrength)
                        const force = mouseVel.mul(forceFactor).mul(0.5)
                        newVel.assign(newVel.add(force))
                })

                // Divergence calculation and pressure projection (simplified)
                const left = getVelocity(uv.sub(vec2(pixelSize.x, 0)))
                const right = getVelocity(uv.add(vec2(pixelSize.x, 0)))
                const bottom = getVelocity(uv.sub(vec2(0, pixelSize.y)))
                const top = getVelocity(uv.add(vec2(0, pixelSize.y)))

                // Calculate divergence
                const divergence = right.x.sub(left.x).add(top.y.sub(bottom.y)).mul(0.5)

                // Simple pressure solve (single iteration)
                const leftP = getPressure(uv.sub(vec2(pixelSize.x, 0)))
                const rightP = getPressure(uv.add(vec2(pixelSize.x, 0)))
                const bottomP = getPressure(uv.sub(vec2(0, pixelSize.y)))
                const topP = getPressure(uv.add(vec2(0, pixelSize.y)))

                const newPressure = leftP.add(rightP).add(bottomP).add(topP).sub(divergence).mul(0.25)

                // Pressure projection (subtract pressure gradient)
                const gradient = vec2(rightP.sub(leftP), topP.sub(bottomP)).mul(0.5)
                const finalVel = newVel.sub(gradient.mul(0.01))

                // Update storage
                velocityField.element(id.x).assign(finalVel)
                pressureField.element(id.x).assign(newPressure)
        })

        // Fragment shader for visualization
        const fs = Fn(([uv]: [Vec2]) => {
                const vel = getVelocity(uv)
                const pressure = getPressure(uv)
                const speed = vel.length()

                // Simple color based on velocity
                const velColor = vec3(
                        vel.x.abs().mul(5.0).clamp(0.0, 1.0),
                        vel.y.abs().mul(5.0).clamp(0.0, 1.0),
                        speed.mul(10.0).clamp(0.0, 1.0)
                )
                const finalColor = vec3(pressure).mul(0.5).add(velColor)

                return vec4(finalColor, 1)
        })

        const gl = useGL({
                particles: [w, h],
                isWebGL: false,
                cs: cs(id),
                fs: fs(uv),
        })

        // Initialize storage buffers
        const initVelocity = new Float32Array(particles * 2).fill(0)
        const initPressure = new Float32Array(particles).fill(0)
        gl.storage(velocityField.props.id!, initVelocity)
        gl.storage(pressureField.props.id!, initPressure)

        const drag = useDrag(() => {
                // useDrag gives pixel coordinates, convert to [0,1]
                const normalizedPos = [drag.value[0] / w, drag.value[1] / h]
                const normalizedPrev = [drag._value[0] / w, drag._value[1] / h]
                mousePos.value = normalizedPos
                mousePrev.value = normalizedPrev
                isDragging.value = drag.isDragging ? 1 : 0
        })

        return (
                <div ref={drag.ref} style={{ position: 'fixed', cursor: 'crosshair' }}>
                        <canvas ref={gl.ref} />
                </div>
        )
}
