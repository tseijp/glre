/**
 * ref: https://www.shadertoy.com/view/tsXGW4
 */
import { Float, Fn, id, storage, uv, UVec3, vec3, Vec2, vec4, vec2, uniform, float, If, Return } from 'glre/src/node'
import { useGL, isServer } from 'glre/src/react'
import { useDrag } from 'rege/react'

export default function ReactionDiffusionApp() {
        const [w, h] = isServer() ? [0, 0] : [window.innerWidth, window.innerHeight]
        const particleCount = w * h
        const data = storage(vec2(), 'data')
        const mousePos = uniform(vec2(-1, -1))
        const isDragging = uniform(float(0))

        const idx2uv = (idx: Float) => {
                return vec2(idx.mod(w).div(w), idx.div(w).floor().div(h))
        }

        const uv2idx = (uv: Vec2, dx = 0, dy = 0) => {
                const x = uv.x.mul(w).add(dx).floor()
                const y = uv.y.mul(h).add(dy).floor()
                return y.mul(w).add(x)
        }

        const idx2cell = (idx: Float) => data.element(idx.toUInt())

        const uv2cell = (uv: Vec2, dx = 0, dy = 0) => idx2cell(uv2idx(uv, dx, dy))

        const cs = Fn(([id]: [UVec3]) => {
                const idx = id.x.toFloat().toVar('idx')
                const uv = idx2uv(idx).toVar('uv')
                If(isDragging.greaterThan(0), () => {
                        const dist = uv.sub(mousePos).length().toVar()
                        If(dist.lessThan(0.05), () => {
                                data.element(id.x).assign(vec2(0, 1))
                                Return()
                        })
                })
                const conv = (dx: number, dy: number, c: number) => {
                        return uv2cell(uv, dx, dy).mul(c)
                }
                // prettier-ignore
                const L = conv(-1, -1,  0.05).add(conv(-1, 0, 0.2)).add(conv(-1, 1, 0.05))
                     .add(conv( 0, -1,  0.2)).add(conv( 0, 0,  -1)).add(conv( 0, 1, 0.2))
                     .add(conv( 1, -1, 0.05)).add(conv( 1, 0, 0.2)).add(conv( 1, 1, 0.05))
                const current = idx2cell(id.x).toVar()
                const diffusion = vec2(1, 0.5)
                const feed = vec2(0.055, 0)
                const kill = vec2(0, 0.055 + 0.062)
                const AB2 = current.y.pow(2).mul(current.x)
                const reaction = vec2(AB2.negate(), AB2)
                let result = L.mul(diffusion)
                        .add(reaction)
                        .add(kill.oneMinus().mul(current))
                        .add(current.oneMinus().mul(feed))
                        .clamp(vec2(0, 0), vec2(1, 1))
                        .toVar()

                data.element(id.x).assign(result)
        })

        const fs = Fn(([uv]: [Vec2]) => {
                const t = uv2cell(uv)
                const dx = t.x.dFdx()
                const dy = t.x.dFdy()
                const dz = dx.pow(2).add(dy.pow(2)).oneMinus()
                const n = vec3(dx, dy, dz)
                const li = mousePos.sub(uv)
                return vec4(vec3(li, 1).normalize().dot(n).pow(2).toVec3(), 1)
        })

        const gl = useGL({
                particleCount: [w, h],
                isWebGL: false,
                cs: cs(id),
                fs: fs(uv),
                mount() {
                        const initData = new Float32Array(particleCount * 2)
                        for (let i = 0; i < particleCount; i++) {
                                initData[i * 2] = 1 // A component (chemical A)
                                initData[i * 2 + 1] = 0 // B component (chemical B) - start empty
                        }
                        gl.storage(data.props.id!, initData)
                },
        })

        const drag = useDrag(() => {
                mousePos.value = [drag.value[0] / w, drag.value[1] / h]
                isDragging.value = drag.isDragging ? 1 : 0
        })

        return (
                <div ref={drag.ref} style={{ position: 'fixed', cursor: 'crosshair' }}>
                        <canvas ref={gl.ref} />
                </div>
        )
}
