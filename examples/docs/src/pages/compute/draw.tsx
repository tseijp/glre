import { aspect, lineSDF } from 'glre/src/addons'
import { Fn, float, id, If, iResolution, storage, uniform, uv, UVec3, vec2, vec3, vec4, Vec2, Return } from 'glre/src/node'
import { useGL, isServer } from 'glre/src/react'
import { useDrag } from 'reev/gesture/drag/react'

const isWebGL = false

const asp = (value: Vec2) => aspect(value, iResolution).div(iResolution)

export default function GPGPUDrawApp() {
        const m0 = uniform<'vec2'>([-1, -1])
        const m1 = uniform<'vec2'>([-1, -1])
        const data = storage(float())
        const [w, h] = isServer() ? [1280, 800] : [window.innerWidth, window.innerHeight]

        const cs = Fn(([id]: [UVec3]) => {
                const isDragging = m0.x.greaterThan(0).and(m1.x.greaterThan(0)).toVar('isDragging')
                const current = data.element(id.x).toVar('current')
                If(isDragging, () => {
                        const index = id.x.toFloat().toVar('index')
                        const x = index.mod(w).toVar('x')
                        const y = index.div(w).toVar('y')
                        const uv = vec2(x, y).toVar('uv')
                        const isBrush = lineSDF(asp(uv), asp(m0), asp(m1)).lessThan(0.01)
                        If(isBrush, () => {
                                data.element(id.x).assign(0)
                                Return()
                        })
                })
                data.element(id.x).assign(current)
        })

        const fs = Fn(([uv]: [Vec2]) => {
                const x = uv.x.mul(w).toVar('x')
                const y = uv.y.mul(h).floor().toVar('y')
                const Y = isWebGL ? y.sub(h).negate() : y
                const index = Y.mul(w).add(x).toUInt().toVar('index')
                const value = data.element(index).toVar('value')
                return vec4(vec3(value), 1)
        })

        const gl = useGL({
                particleCount: [w, h],
                isWebGL,
                cs: cs(id),
                fs: fs(uv),
        })

        const drag = useDrag(() => {
                m1.value = drag._value
                if (drag.isDragging) {
                        m0.value = drag.value
                } else m0.value = [-1, -1]
        })

        gl.storage(data.props.id, new Float32Array(w * h).fill(1))

        return (
                <div ref={drag.ref} style={{ position: 'fixed', width: '100%', height: '100%' }}>
                        <canvas ref={gl.ref} />
                </div>
        )
}
