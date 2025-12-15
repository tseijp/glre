// @ts-ignore
import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { useEffect, useState } from 'react'
import { attribute, float, Fn, If, instance, int, ivec2, mat4, texelFetch, texture2D, uniform, vec3, vec4, vertexStage } from 'glre/src/node'
import { type GL } from 'glre/src'
import type { Float, IVec2, IVec3, Vec3 } from 'glre/src/node'

const SCOPE = { x0: 28, x1: 123, y0: 75, y1: 79 }
const ROW = SCOPE.x1 - SCOPE.x0 + 1 // 96 region = 96×16×16 voxel [m]
const SLOT = 16
const REGION = 256
const range = (n = 0) => [...Array(n).keys()]

const createNode = () => {
        const iMVP = uniform<'mat4'>(mat4(), 'iMVP')
        const iAtlas = range(SLOT).map((i) => uniform(texture2D(), `iAtlas${i}`))
        const iOffset = range(SLOT).map((i) => uniform(vec3(0, 0, 0), `iOffset${i}`))
        const vertex = attribute<'vec3'>([-0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5], 'vertex')
        const normal = attribute<'vec3'>([-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], 'normal')
        const scl = instance<'vec3'>(vec3(), 'scl')
        const pos = instance<'vec3'>(vec3(), 'pos')
        const aid = instance<'float'>(float(), 'aid')
        const atlas = Fn(([p]: [IVec3]) => {
                const ci = p.div(int(16)).mul(int(16)).toVar('ci') // left shift like k & 3
                const lp = p.sub(ci).toVar('lp') // ................ right shift like k >> 2
                const a = int(ci.z.div(int(64))).toVar('a')
                const b = int(ci.z.div(int(16)).sub(a.mul(int(4)))).toVar('b')
                const c = int(lp.z.div(int(4))).toVar('c')
                const d = int(lp.z.sub(c.mul(int(4)))).toVar('d')
                const zt = ivec2(b, a).mul(int(1024))
                const lt = ivec2(d, c).mul(int(16)).add(lp.xy)
                return int(4).mul(ci.xy).add(zt).add(lt)
        })
        const pick = Fn(([id, uvPix]: [Float, IVec2]) => {
                const t = vec4(0, 0, 0, 1).toVar('t')
                range(SLOT).map((i) => {
                        If(id.equal(i), () => {
                                t.assign(texelFetch(iAtlas[i], uvPix, int(0)))
                        })
                })
                return t
        })
        const center = Fn(([vertex, scl, pos, n]: [Vec3, Vec3, Vec3, Vec3]) => {
                return vertex.mul(scl).add(pos).sub(n.sign().mul(0.5)).floor()
        })
        const diffuse = Fn(([n]: [Vec3]) => {
                return vec3(-0.33, 0.77, 0.55).normalize().dot(n).mul(0.5).add(0.5)
        })
        const fs = Fn(([p, d, i]: [IVec3, Float, Float]) => {
                const uv = atlas(p).toVar('uv')
                const rgb = pick(i, uv).rgb.mul(d).toVar('rgb')
                return vec4(rgb, 1)
        })
        const vs = Fn(([pos, scl, aid]: [Vec3, Vec3, Float]) => {
                const off = vec3(0, 0, 0).toVar('off')
                range(SLOT).forEach((i) => {
                        If(aid.equal(i), () => {
                                off.assign(iOffset[i])
                        })
                })
                const local = vertex.mul(scl).add(pos)
                const world = off.add(local)
                return iMVP.mul(vec4(world, 1))
        })
        const frag = fs(vertexStage(center(vertex, scl, pos, normal)).toIVec3(), vertexStage(diffuse(normal)), vertexStage(aid))
        const vert = vs(pos, scl, aid)
        return { vert, frag, iMVP }
}

const createMode = () => {
        let mode = -1 // 0 is creative
        let _mode = 1 // last non-pause mode
        const tab = () => {
                if (mode === 2) return mode // paused: keep mode on tab
                if (mode === 0) return (mode = _mode = 1)
                if (mode === 1) return (mode = _mode = 0)
                return (_mode = mode)
        }
        const esc = () => {
                if (mode === -1) return (mode = _mode = 1)
                if (mode === 2) return (mode = _mode)
                ;[_mode, mode] = [mode, 2]
                return mode
        }
        return { tab, esc }
}

const createViewer = async () => {
        const { createCamera, createMesh, createQueues, createRegions, createSlots } = await import('voxelized-js')
        let isReady = false
        let isLoading = false
        let ts = performance.now()
        let pt = ts
        let dt = 0
        let pt2 = ts - 200
        const cam = createCamera({ X: (Math.random() * 0.5 + 0.5) * ROW * REGION, Y: 720, Z: (REGION * (SCOPE.y1 - SCOPE.y0 + 1)) / 2 })
        const mesh = createMesh()
        const mode = createMode()
        const node = createNode()
        const slots = createSlots(SLOT)
        const queues = createQueues(4, 1)
        const regions = createRegions(mesh as any, cam as any, queues as any)
        try {
                cam.update(1280 / 800) // Ensure MVP is valid for culling before first render.
                regions.vis()
        } catch {}
        const resize = (gl: GL) => {
                cam.update(gl.size[0] / gl.size[1])
                node.iMVP.value = [...cam.MVP]
        }
        const render = (gl: GL) => {
                pt = ts
                ts = performance.now()
                dt = Math.min((ts - pt) / 1000, 0.03) // 0.03 is 1 / (30fps)
                if (mesh.isReady()) {
                        if (!isReady) document.getElementById('loading')?.remove()
                        isReady = true
                        cam.tick(dt, regions.pick)
                        cam.update(gl.size[0] / gl.size[1])
                        node.iMVP.value = [...cam.MVP]
                }
                const { program, context } = gl
                if (!isLoading)
                        if (ts - pt2 >= 100) {
                                pt2 = ts
                                mesh.reset()
                                slots.begin(regions.vis())
                                isLoading = true
                        }
                if (isLoading)
                        if (slots.step(context, program, 6)) {
                                mesh.commit()
                                isLoading = false
                        }
                gl.instanceCount = mesh.draw(context, program)
        }
        return { mode, node, cam, render, resize, pt: 0 }
}

type Viewer = Awaited<ReturnType<typeof createViewer>>

const Canvas = ({ viewer }: { viewer: Viewer }) => {
        const gl = useGL({
                precision: 'highp',
                // wireframe: true,
                // isDebug: true,
                isWebGL: true,
                isDepth: true,
                count: 36, // Total number of cube triangles vertices
                instanceCount: 1, // count of instanced mesh in initial state
                vert: viewer.node.vert,
                frag: viewer.node.frag,
                render() {
                        viewer.render(gl)
                },
                resize() {
                        viewer.resize(gl)
                },
                mount() {
                        const el = gl.el
                        if (!el) return
                        const isSP = window.innerWidth <= 768
                        const press = (isPress = false, e: KeyboardEvent) => {
                                const k = e.code
                                if (k === 'KeyW') viewer.cam.asdw(1, isPress ? 1 : 0)
                                if (k === 'KeyS') viewer.cam.asdw(1, isPress ? -1 : 0)
                                if (k === 'KeyA') viewer.cam.asdw(2, isPress ? 1 : 0)
                                if (k === 'KeyD') viewer.cam.asdw(2, isPress ? -1 : 0)
                                if (k === 'Space') viewer.cam.space(isPress)
                                if (k === 'ArrowUp') viewer.cam.asdw(1, isPress ? 1 : 0)
                                if (k === 'ArrowDown') viewer.cam.asdw(1, isPress ? -1 : 0)
                                if (k === 'ArrowLeft') viewer.cam.asdw(2, isPress ? 1 : 0)
                                if (k === 'ArrowRight') viewer.cam.asdw(2, isPress ? -1 : 0)
                                if (k === 'MetaLeft') viewer.cam.shift(isPress)
                                if (k === 'MetaRight') viewer.cam.shift(isPress)
                                if (k === 'ShiftLeft') viewer.cam.shift(isPress)
                                if (k === 'ShiftRight') viewer.cam.shift(isPress)
                                if (k === 'ControlLeft') viewer.cam.shift(isPress)
                                if (k === 'ControlRight') viewer.cam.shift(isPress)
                                if (k === 'Tab' && isPress) {
                                        e.preventDefault()
                                        viewer.cam.mode(viewer.mode.tab())
                                }
                        }
                        const onMove = (e: any) => {
                                viewer.cam.turn([-e.movementX, -e.movementY])
                        }
                        let px = 0
                        let py = 0
                        const touchXY = (e: TouchEvent) => {
                                if (e.touches.length !== 1) return [0, 0]
                                // e.preventDefault()
                                const touch = e.touches[0]
                                return [touch.clientX, touch.clientY]
                        }
                        const onTouchStart = (e: TouchEvent) => {
                                ;[px, py] = touchXY(e)
                        }
                        const onTouch = (e: TouchEvent) => {
                                const [x, y] = touchXY(e)
                                const dx = x - px
                                const dy = y - py
                                px = x
                                py = y
                                viewer.cam.turn([dx * 8, dy * 3])
                        }
                        const onLock = () => {
                                viewer.pt = performance.now()
                                viewer.cam.mode(viewer.mode.esc())
                        }
                        const onDown = (trial = 0) => {
                                if (!el) return
                                if (trial > 20) return
                                if (performance.now() - viewer.pt < 1300) return setTimeout(() => onDown(trial + 1), 100) // if the user requests within 1250 ms of escaping, the following error occurs: `ERROR: The user has exited the lock before this request was completed.`
                                try {
                                        document.body.requestPointerLock()
                                } finally {
                                }
                        }
                        if (isSP) {
                                document.addEventListener('touchstart', onTouchStart, { passive: false })
                                document.addEventListener('touchmove', onTouch, { passive: false })
                                document.addEventListener('mousemove', onMove, { passive: false })
                        } else {
                                if (el) el.addEventListener('mousedown', onDown.bind(null, 0))
                                document.addEventListener('mousemove', onMove)
                                window.addEventListener('keyup', press.bind(null, false))
                                window.addEventListener('keydown', press.bind(null, true))
                                document.addEventListener('pointerlockchange', onLock)
                        }
                },
        })
        return <canvas ref={gl.ref} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }} />
}

export default function Home() {
        const [viewer, set] = useState<Viewer>()
        useEffect(() => void createViewer().then(set), [])
        return (
                <Layout noFooter>
                        <div id="loading" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                <span style={{ marginRight: '0.5rem' }}>Loading</span>
                                <svg width="24" height="8" viewBox="0 0 24 8">
                                        <circle cx="4" cy="4" r="1" fill="currentColor">
                                                <animate attributeName="opacity" values="0;1;0" dur="0.9s" repeatCount="indefinite" />
                                        </circle>
                                        <circle cx="12" cy="4" r="1" fill="currentColor">
                                                <animate attributeName="opacity" values="0;1;0" dur="0.9s" begin="0.2s" repeatCount="indefinite" />
                                        </circle>
                                        <circle cx="20" cy="4" r="1" fill="currentColor">
                                                <animate attributeName="opacity" values="0;1;0" dur="0.9s" begin="0.4s" repeatCount="indefinite" />
                                        </circle>
                                </svg>
                        </div>
                        {viewer ? <Canvas viewer={viewer} /> : null}
                </Layout>
        )
}
