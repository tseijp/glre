// @ts-ignore
import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { sphere } from 'glre/src/buffers'
import { Fn, mat4, Scope, texture, uniform, uv, varying, vec2, vec3, Vec3, vec4 } from 'glre/src/node'
import { mat4 as m } from 'gl-matrix'

export default function EnvironApp() {
        const tmp1 = m.create()
        const tmp2 = m.create()
        const env = uniform('https://r.tsei.jp/texture/hdr.jpg')
        const cam = uniform(vec3())
        const mat = uniform(mat4())
        const inv = uniform(mat4())
        const geo = sphere({ radius: 1, widthSegments: 128, heightSegments: 128 })
        const update = () => {
                const [yaw, pitch] = gl.offset
                const cos = Math.cos(pitch)
                const pos = [2 * Math.sin(yaw) * cos, 2 * Math.sin(pitch), 2 * Math.cos(yaw) * cos]
                const P = m.perspective(tmp1, 1.047, innerWidth / innerHeight, 0.1, 100)
                const V = m.lookAt(tmp2, pos, [0, 0, 0], [0, 1, 0])
                const VP = m.multiply(tmp1, P, V)
                cam.value = pos
                mat.value = VP
                inv.value = m.invert(tmp2, VP)
        }
        const dir2uv = Fn(([d]: [Vec3]) => {
                return vec2(d.x.atan2(d.z), d.y.asin()).div(vec2(6.28, -3.14)).add(0.5)
        })
        const gl = useGL(
                {
                        isWebGL: true,
                        isDepth: true,
                        attributes: {},
                        fragment: Scope(() => {
                                const d = inv.mul(vec4(uv.fma(2, -1), 1, 1)).xyz.normalize()
                                return texture(env, dir2uv(d))
                        }),
                },
                {
                        count: geo.count,
                        vertex: mat.mul(vec4(geo.vertex(), 1)),
                        attributes: { vertex: null, normal: null },
                        fragment: Scope(() => {
                                const p = varying(geo.vertex())
                                const n = varying(geo.normal())
                                const d = p.sub(cam).normalize().refract(n, 0.9) // .reflect(n)
                                return texture(env, dir2uv(d))
                        }),
                        render() {
                                update()
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
