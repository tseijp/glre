/**
 * ref: https://www.shadertoy.com/view/tsXGW4
 */
import { Float, Fn, id, storage, uv, UVec3, vec3, Vec2, vec4, vec2, iMouse } from 'glre/src/node'
import { useGL, isServer } from 'glre/src/react'

export default function ReactionDiffusionApp() {
        const [w, h] = isServer() ? [0, 0] : [window.innerWidth, window.innerHeight]
        const particles = w * h
        const data = storage(vec2(), 'data')
        const pos = (idx: Float) => vec2(idx.mod(w), idx.div(w).floor())
        const cell = (uv: Vec2) => data.element(index(uv).toUInt())
        const index = (uv: Vec2) => uv.y.mul(h).add(uv.x).mul(w)

        const cs = Fn(([id]: [UVec3]) => {
                const idx = id.x.toFloat().toVar('idx')
                const s = vec2(1).div(vec2(w, h)).toVar('s')
                const uv = pos(idx).mul(s).toVar('uv')
                const conv = (dx: number, dy: number, c: number) => cell(vec2(dx, dy).mul(s).add(uv)).mul(c)
                const L = conv(-1, -1, 0.05)
                        .add(conv(0, -1, 0.2))
                        .add(conv(1, -1, 0.05))
                        .add(conv(-1, 0, 0.2))
                        .add(conv(0, 0, -1))
                        .add(conv(1, 0, 0.2))
                        .add(conv(-1, 1, 0.05))
                        .add(conv(0, 1, 0.2))
                        .add(conv(1, 1, 0.05))
                const current = cell(uv).toVar()
                const diffusion = vec2(1, 0.5)
                const feed = vec2(0.055, 0)
                const kill = vec2(0, 0.055 + 0.062)
                const AB2 = current.y.pow(2).mul(current.x)
                const reaction = vec2(AB2.negate(), AB2)
                const result = L.mul(diffusion)
                        .add(reaction)
                        .add(kill.oneMinus().mul(current))
                        .add(current.oneMinus().mul(feed))
                        .clamp(vec2(0, 0), vec2(1, 1))
                data.element(id.x).assign(result)
        })

        // Fragment shader for visualization
        const fs = Fn(([uv]: [Vec2]) => {
                const t = cell(uv)
                const dx = t.x.dFdx()
                const dy = t.x.dFdy()
                const dz = dx.pow(2).add(dy.pow(2)).oneMinus()
                const n = vec3(dx, dy, dz)
                const li = vec3(iMouse, 0.3).sub(vec3(uv, 0)).normalize()
                const a = li.dot(n).clamp(0, 1)
                return vec4(a, a.pow(2), 0.4, 1)
        })

        const gl = useGL({
                particles: [w, h],
                isWebGL: false,
                cs: cs(id),
                fs: fs(uv),
                mount() {
                        const initData = new Float32Array(particles * 2)
                        for (let i = 0; i < particles; i++) {
                                const x = (i % w) / w
                                const y = Math.floor(i / w) / h
                                const box1 = boxJS(x, y, 0.5, 0.5, 0.5, 0.5, -4)
                                const box2 = boxJS(x, y, 0.6, 0.3, 0.4, 0.5, -1)
                                const box3 = boxJS(x, y, 0.4, 0.7, 0.5, 0.4, -2)
                                const pattern = -box1 + box2 + box3
                                initData[i * 2] = 1
                                initData[i * 2 + 1] = pattern > 1 ? 1 : 0
                        }
                        gl.storage(data.props.id!, initData)
                },
        })

        const boxJS = (px: number, py: number, cx: number, cy: number, dx: number, dy: number, a: number) => {
                const c = Math.cos(a)
                const s = Math.sin(a)
                const ex = (px - 0.5) * c + (py - 0.5) * -s + 0.5
                const ey = (px - 0.5) * s + (py - 0.5) * c + 0.5
                const hx = dx / 2
                const hy = dy / 2
                const stepX1 = ex >= cx - hx ? 1 : 0
                const stepX2 = ex >= cx + hx ? 1 : 0
                const stepY1 = ey >= cy - hy ? 1 : 0
                const stepY2 = ey >= cy + hy ? 1 : 0
                return stepX1 - stepX2 + (stepY1 - stepY2)
        }

        return <canvas ref={gl.ref} />
}
