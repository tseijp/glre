import { Fn, float, Float, id, If, storage, uniform, uv, UVec3, vec2, vec3, vec4, Vec2 } from 'glre/src/node'
import { useGL, isServer } from 'glre/src/react'
import { useDrag } from 'reev/gesture/drag/react'

const isWebGL = false

export default function FluidSimulationApp() {
        const [w, h] = isServer() ? [256, 256] : [window.innerWidth, window.innerHeight]
        const particleCount = w * h
        const velocity = storage(vec2(), 'velocity')
        const pressure = storage(float(), 'pressure')
        const mousePos = uniform(vec2(0, 0))
        const mousePrev = uniform(vec2(0, 0))
        const isDragging = uniform(float(0))
        const forceRadius = uniform(float(0.1))
        const forceStrength = uniform(float(10))

        const idx2uv = (idx: Float) => {
                return vec2(idx.mod(w).div(w), idx.div(w).floor().div(h))
        }

        const uv2idx = (uv: Vec2, dx = 0, dy = 0) => {
                const x = uv.x.mul(w).add(dx).clamp(0, w).floor()
                const y = uv.y.mul(h).add(dy).clamp(0, h).floor()
                return y.mul(w).add(x).toUInt()
        }

        const getVelocity = (uv: Vec2, dx = 0, dy = 0) => {
                return velocity.element(uv2idx(uv, dx, dy)) as unknown as Vec2
        }

        const getPressure = (uv: Vec2, dx = 0, dy = 0) => {
                return pressure.element(uv2idx(uv, dx, dy))
        }

        const fluid = Fn(([uv]: [Vec2]) => {
                const va = getVelocity(uv, -1, 0).x.toVar()
                const vb = getVelocity(uv, 1, 0).x.toVar()
                const vc = getVelocity(uv, 0, -1).y.toVar()
                const vd = getVelocity(uv, 0, 1).y.toVar()
                const pa = getPressure(uv, -1, 0).toVar()
                const pb = getPressure(uv, 1, 0).toVar()
                const pc = getPressure(uv, 0, -1).toVar()
                const pd = getPressure(uv, 0, 1).toVar()
                const div = vb.sub(va).add(vd.sub(vc)).div(2)
                const press = pa.add(pb).add(pc).add(pd).sub(div).mul(0.05)
                const grad = vec2(pb.sub(pa), pd.sub(pc)).div(2)
                return vec3(grad, press)
        })

        const cs = Fn(([id]: [UVec3]) => {
                const idx = id.x.toFloat()
                const uv = idx2uv(idx).toVar()
                const prevVel = velocity.element(id.x) as unknown as Vec2
                const prevPos = uv.sub(prevVel.mul(0.01))
                const nextVel = getVelocity(prevPos, 0, 0).mul(0.99).toVar()
                If(isDragging.greaterThan(0), () => {
                        const f = uv.sub(mousePos).length().div(forceRadius).oneMinus().clamp(0, 1)
                        nextVel.addAssign(mousePos.sub(mousePrev).mul(forceStrength.mul(f).mul(0.5)))
                })
                const result = fluid(uv)
                const finalVel = nextVel.sub(result.xy.mul(0.01))
                velocity.element(id.x).assign(finalVel)
                pressure.element(id.x).assign(result.z)
        })

        const fs = Fn(([uv]: [Vec2]) => {
                if (isWebGL) uv.y = uv.y.oneMinus()
                const pre = getPressure(uv)
                const vel = getVelocity(uv)
                const speed = vel.length()
                const velColor = vec3(vel.mul(8).abs(), speed.mul(10.0))
                const finalColor = vec3(pre).div(2).add(velColor)
                return vec4(finalColor, 1)
        })

        const gl = useGL({
                particleCount,
                isWebGL,
                cs: cs(id),
                fs: fs(uv),
                mount() {
                        gl.storage(velocity.props.id!, new Float32Array(particleCount * 2).fill(0))
                        gl.storage(pressure.props.id!, new Float32Array(particleCount).fill(0))
                },
        })

        const drag = useDrag(() => {
                mousePos.value = [drag.value[0] / w, drag.value[1] / h]
                mousePrev.value = [drag._value[0] / w, drag._value[1] / h]
                isDragging.value = drag.isDragging ? 1 : 0
        })

        return (
                <div ref={drag.ref} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', cursor: 'crosshair' }}>
                        <canvas ref={gl.ref} />
                </div>
        )
}
