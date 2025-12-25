// @ts-ignore
import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { attribute, builtin, float, Fn, iResolution, mat3, mat4, position, Scope, texture, uniform, uv, varying, vec2, vec3, Vec3, vec4 } from 'glre/src/node'
import { mat4 as m } from 'gl-matrix'

export default function EnvironmentMap() {
        let yaw = 0
        let pitch = 0
        let mouseDown = false
        let mouseLast = [0, 0]
        const tmp1 = m.create()
        const tmp2 = m.create()
        const env = uniform('https://r.tsei.jp/texture/hdr.jpg')
        const cam = uniform(vec3())
        const mat = uniform(mat4())
        const inv = uniform(mat4())
        const cube = attribute(vec3([-0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5]), 'cube')
        const norm = attribute(vec3([-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]), 'norm')
        const update = () => {
                const cos = Math.cos(pitch)
                const pos = [2 * Math.sin(yaw) * cos, 2 * Math.sin(pitch), 2 * Math.cos(yaw) * cos]
                const P = m.perspective(tmp1, 1.047, innerWidth / innerHeight, 0.1, 100)
                const V = m.lookAt(tmp2, pos, [0, 0, 0], [0, 1, 0])
                const VP = m.multiply(tmp1, P, V)
                cam.value = pos
                mat.value = VP
                inv.value = m.invert(tmp2, VP)
        }
        const _uv = Fn(([_d]: [Vec3]) => {
                const d = _d.normalize()
                return vec2(d.x.atan2(d.z), d.y.asin()).div(vec2(6.28, 3.14)).mul(vec2(1, -1)).add(0.5)
        })
        const gl = useGL(
                {
                        // isDepth: true,
                        isWebGL: true,
                        fragment: texture(env, _uv(inv.mul(vec4(uv.mul(2).sub(1), 1, 1)).xyz)),
                },
                {
                        triangleCount: 12,
                        vertex: mat.mul(vec4(cube, 1)),
                        fragment: Scope(() => {
                                const p = varying(cube)
                                const n = varying(norm)
                                const d = p.sub(cam).normalize().toVar().reflect(n)
                                return texture(env, _uv(d))
                        }),
                        render() {
                                if (mouseDown) return
                                yaw += 0.001
                                update()
                        },
                        mousemove(e) {
                                if (!mouseDown) return
                                yaw -= (e.clientX - mouseLast[0]) * 0.01
                                pitch = Math.max(-0.7, Math.min(0.7, pitch + (e.clientY - mouseLast[1]) * 0.01))
                                mouseLast = [e.clientX, e.clientY]
                                update()
                        },
                        mount() {
                                gl.el.addEventListener('mousedown', (e) => void ((mouseDown = true), (mouseLast = [e.clientX, e.clientY])))
                                gl.el.addEventListener('mouseover', () => (mouseDown = false))
                                gl.el.addEventListener('mouseup', () => (mouseDown = false))
                        },
                }
        )
        return (
                <Layout noFooter>
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
                                <canvas ref={gl.ref} />
                        </div>
                </Layout>
        )
}
