// @ts-ignore
import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { attribute, Fn, mat4, Scope, texture, uniform, uv, varying, vec2, vec3, Vec3, vec4 } from 'glre/src/node'
import { mat4 as m } from 'gl-matrix'

const createSphere = (radius = 0.5, widthSegments = 16, heightSegments = 12, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) => {
        const vertices = []
        const normals = []
        for (let y = 0; y <= heightSegments; y++) {
                const v = y / heightSegments
                const theta = thetaStart + v * thetaLength
                for (let x = 0; x <= widthSegments; x++) {
                        const u = x / widthSegments
                        const phi = phiStart + u * phiLength
                        const st = Math.sin(theta)
                        const ct = Math.cos(theta)
                        const sp = Math.sin(phi)
                        const cp = Math.cos(phi)
                        const px = radius * st * cp
                        const py = radius * ct
                        const pz = radius * st * sp
                        vertices.push(px, py, pz)
                        normals.push(st * cp, ct, st * sp)
                }
        }
        const indices = []
        for (let y = 0; y < heightSegments; y++) {
                for (let x = 0; x < widthSegments; x++) {
                        const a = (y + 1) * (widthSegments + 1) + x
                        const b = (y + 1) * (widthSegments + 1) + x + 1
                        const c = y * (widthSegments + 1) + x
                        const d = y * (widthSegments + 1) + x + 1
                        indices.push(a, c, b, b, c, d)
                }
        }
        const ret = { positions: [], normals: [] }
        for (let i = 0; i < indices.length; i++) {
                const idx = indices[i] * 3
                ret.positions.push(vertices[idx], vertices[idx + 1], vertices[idx + 2])
                ret.normals.push(normals[idx], normals[idx + 1], normals[idx + 2])
        }
        return ret
}

export default function EnvironApp() {
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
        const geo = createSphere(1, 128, 128)
        const sphere = attribute(vec3(geo.positions))
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
        const dir2uv = Fn(([d]: [Vec3]) => {
                return vec2(d.x.atan2(d.z), d.y.asin()).div(vec2(6.28, -3.14)).add(0.5)
        })
        const gl = useGL(
                {
                        isDepth: true,
                        isWebGL: true,
                        fragment: Scope(() => {
                                const d = inv.mul(vec4(uv.fma(2, -1), 1, 1)).xyz.normalize()
                                return texture(env, dir2uv(d))
                        }),
                },
                {
                        triangleCount: geo.positions.length / 9,
                        vertex: mat.mul(vec4(sphere, 1)),
                        fragment: Scope(() => {
                                const p = varying(sphere)
                                const n = varying(attribute(vec3(geo.normals)))
                                const d = p.sub(cam).normalize().refract(n, 0.9) // .reflect(n)
                                return texture(env, dir2uv(d))
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
