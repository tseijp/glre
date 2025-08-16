import { aspect, lineSDF } from 'glre/src/addons'
import { Fn, float, id, If, iResolution, storage, uniform, uv, UVec3, vec2, vec3, vec4, Vec2 } from 'glre/src/node'
import { isServer, useGL } from 'glre/src/react'
import { useDrag } from 'rege/react'

const isWebGL = false

export default function GPGPUDrawApp() {
        const [w, h] = isServer() ? [1280, 800] : [window.innerWidth, window.innerHeight]
        const particles = w * h
        const m0 = uniform<'vec2'>([-1, -1])
        const m1 = uniform<'vec2'>([-1, -1])
        const data = storage(float())
        const a = (value: Vec2) => aspect(value, iResolution).div(iResolution)

        const cs = Fn(([id]: [UVec3]) => {
                const isDragging = m0.x.greaterThan(0).toVar('isDragging')
                const current = data.element(id.x).toVar('current')
                If(isDragging, () => {
                        const index = id.x.toFloat().toVar('index')
                        const x = index.mod(w).toVar('x')
                        const y = index.div(w).toVar('y')
                        const uv = vec2(x, y).toVar('uv')
                        // draw
                        const isBrush = lineSDF(a(uv), a(m0), a(m1)).lessThan(0.003).toFloat().toVar('isBrush')
                        const next = current.mix(0, isBrush).toVar('next')
                        data.element(id.x).assign(next)
                }).Else(() => {
                        data.element(id.x).assign(current)
                })
        })

        const fs = Fn(([uv]: [Vec2]) => {
                const Y = isWebGL ? uv.y.oneMinus() : uv.y
                const x = uv.x.mul(w).floor().toVar('x')
                const y = Y.mul(h).floor().toVar('y')
                const index = y.mul(w).add(x).toVar('index')
                const value = data.element(index.toUInt()).toVar('value')
                return vec4(vec3(value), 1)
        })

        const gl = useGL({
                particles,
                isWebGL,
                cs: cs(id),
                fs: fs(uv),
        })

        const drag = useDrag(() => {
                if (drag.isDragging) {
                        m0.value = drag.value
                } else m0.value = [-1, -1]
                m1.value = drag._value
        })

        gl.storage(data.props.id, new Float32Array(gl.particles).fill(1))

        return (
                <div ref={drag.ref} style={{ position: 'fixed' }}>
                        <canvas ref={gl.ref} />
                </div>
        )
}
