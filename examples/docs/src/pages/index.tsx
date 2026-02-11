import Layout from '@theme/Layout'
import { box } from 'glre/src/buffers'
import { useGL } from 'glre/src/react'
import { useEffect, useState } from 'react'
import { float, Fn, If, instance, int, ivec2, ivec3, mat4, Scope, texelFetch, texture2D, uniform, varying, vec3, vec4 } from 'glre/src/node'
import type { Drag, GL } from 'glre/src'
import type { Float, Int, IVec2, IVec3, Vec3 } from 'glre/src/node'

const SLOT = 16
const range = (n = 0) => [...Array(n).keys()]
const mff0000ff = int(0xff0000ff).constant()
const m0300f00f = int(0x0300f00f).constant()
const m030c30c3 = int(0x030c30c3).constant()
const m09249249 = int(0x09249249).constant()
const m5555 = int(0x55555555).constant()
const m3333 = int(0x33333333).constant()
const m0f0f = int(0x0f0f0f0f).constant()
const m00ff = int(0x00ff00ff).constant()
const mffff = int(0x0000ffff).constant()
const xyz2m = Fn(([xyz]: [IVec3]): Int => {
        const p = xyz.toVar()
        p.bitOrAssign(p.shiftLeft(int(16)))
        p.bitAndAssign(ivec3(mff0000ff))
        p.bitOrAssign(p.shiftLeft(int(8)))
        p.bitAndAssign(ivec3(m0300f00f))
        p.bitOrAssign(p.shiftLeft(int(4)))
        p.bitAndAssign(ivec3(m030c30c3))
        p.bitOrAssign(p.shiftLeft(int(2)))
        p.bitAndAssign(ivec3(m09249249))
        return p.x.bitOr(p.y.shiftLeft(int(1))).bitOr(p.z.shiftLeft(int(2)))
})
const m2uv = Fn(([morton]: [Int]): IVec2 => {
        const p = ivec2(morton, morton.shiftRight(int(1))).toVar()
        p.bitAndAssign(ivec2(m5555))
        p.bitOrAssign(p.shiftRight(int(1)))
        p.bitAndAssign(ivec2(m3333))
        p.bitOrAssign(p.shiftRight(int(2)))
        p.bitAndAssign(ivec2(m0f0f))
        p.bitOrAssign(p.shiftRight(int(4)))
        p.bitAndAssign(ivec2(m00ff))
        p.bitOrAssign(p.shiftRight(int(8)))
        p.bitAndAssign(ivec2(mffff))
        return p
})

const createNode = () => {
        const iMVP = uniform<'mat4'>(mat4(), 'iMVP')
        const cube = box()
        const iAtlas = range(SLOT).map((i) => uniform(texture2D(), `iAtlas${i}`))
        const iOffset = range(SLOT).map((i) => uniform(vec3(0, 0, 0), `iOffset${i}`))
        const vertex = cube.vertex()
        const normal = cube.normal()
        const scl = instance<'vec3'>(vec3(), 'scl')
        const pos = instance<'vec3'>(vec3(), 'pos')
        const aid = instance<'float'>(float(), 'aid')
        const vCenter = varying<'vec3'>(vec3(), 'vCenter')
        const atlas = Fn(([p]: [IVec3]): IVec2 => {
                const morton = xyz2m(p.clamp(int(0), int(255))).toVar()
                return m2uv(morton)
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
        const diffuse = Fn(([n]: [Vec3]) => {
                return vec3(-0.33, 0.77, 0.55).normalize().dot(n).mul(0.5).add(0.5)
        })
        const vert = Scope(() => {
                const off = vec3(0, 0, 0).toVar('off')
                range(SLOT).forEach((i) => {
                        If(aid.equal(i), () => {
                                off.assign(iOffset[i])
                        })
                })
                const local = vertex.mul(scl).add(pos)
                const world = off.add(local)
                const center = local.sub(normal.sign().mul(0.5)).floor()
                vCenter.assign(center)
                return iMVP.mul(vec4(world, 1))
        })
        const frag = Scope(() => {
                const p = vCenter.toIVec3()
                const d = varying(diffuse(normal))
                const i = varying(aid)
                const uv = atlas(p).toVar('uv')
                const rgb = pick(i, uv).rgb.mul(d).toVar('rgb')
                return vec4(rgb, 1)
        })
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
        const { createCamera, createMesh, createScene } = await import('voxelized-js') // Dynamic import is required. Static import causes ReferenceError: __dirname is not defined.
        let isReady = false
        let ts = performance.now()
        let pt = ts
        let dt = 0
        const worker = new Worker(new URL('../worker.ts', import.meta.url))
        worker.onerror = (e) => console.error('worker error', e)
        const cam = createCamera({ X: 22912, Y: 800, Z: 20096, yaw: Math.PI / 2, pitch: -Math.PI / 2 + 0.01, mode: -1 })
        const mesh = createMesh()
        const scene = createScene(mesh, cam, worker)
        const mode = createMode()
        const node = createNode()

        const press = (isPress = false, e: KeyboardEvent) => {
                const k = e.code
                if (k === 'KeyW') cam.asdw(1, isPress ? 1 : 0)
                if (k === 'KeyS') cam.asdw(1, isPress ? -1 : 0)
                if (k === 'KeyA') cam.asdw(2, isPress ? 1 : 0)
                if (k === 'KeyD') cam.asdw(2, isPress ? -1 : 0)
                if (k === 'Space') cam.space(isPress)
                if (k === 'ArrowUp') cam.asdw(1, isPress ? 1 : 0)
                if (k === 'ArrowDown') cam.asdw(1, isPress ? -1 : 0)
                if (k === 'ArrowLeft') cam.asdw(2, isPress ? 1 : 0)
                if (k === 'ArrowRight') cam.asdw(2, isPress ? -1 : 0)
                if (k === 'MetaLeft') cam.shift(isPress)
                if (k === 'MetaRight') cam.shift(isPress)
                if (k === 'ShiftLeft') cam.shift(isPress)
                if (k === 'ShiftRight') cam.shift(isPress)
                if (k === 'ControlLeft') cam.shift(isPress)
                if (k === 'ControlRight') cam.shift(isPress)
                if (k === 'Tab' && isPress) {
                        e.preventDefault()
                        cam.mode(mode.tab())
                }
        }

        let lastLockTime = 0

        const onLock = () => {
                lastLockTime = performance.now()
                cam.mode(mode.esc())
        }

        const mousemove = (drag: Drag) => {
                if (drag.device === 'touch') return // @ts-ignore
                cam.turn([-drag.event.movementX, -drag.event.movementY])
        }

        const mousedown = (drag: Drag) => {
                const tryLock = (trial = 0) => {
                        if (trial > 20) return
                        if (performance.now() - lastLockTime < 1300) return setTimeout(() => tryLock(trial + 1), 100)
                        try {
                                drag.target.requestPointerLock()
                        } catch (e) {
                                console.error('pointer lock failed:', e)
                        }
                }
                if (drag.device === 'touch') return
                if ('requestPointerLock' in drag.target) tryLock()
        }

        const onKeyUp = (e: KeyboardEvent) => press(false, e)

        const onKeyDown = (e: KeyboardEvent) => press(true, e)

        const resize = (gl: GL) => {
                cam.update(gl.size[0] / gl.size[1])
                node.iMVP.value = [...cam.MVP]
        }

        const render = (gl: GL) => {
                pt = ts
                ts = performance.now()
                dt = Math.min((ts - pt) / 1000, 0.03) // 0.03 is 1 / (30fps)
                cam.tick(dt, scene.pick)
                cam.update(gl.size[0] / gl.size[1])
                node.iMVP.value = [...cam.MVP]
                scene.render(gl.context, gl.program)
                const count = mesh.draw(gl.context, gl.program, gl.vao)
                if (!isReady && count > 0) {
                        document.getElementById('loading')?.remove()
                        isReady = true
                }
                gl.setInstanceCount(count)
        }

        const mount = (el: HTMLCanvasElement) => {
                if (!el) return
                const isSP = window.innerWidth <= 768
                if (isSP) return
                window.addEventListener('keyup', onKeyUp)
                window.addEventListener('keydown', onKeyDown)
                document.addEventListener('pointerlockchange', onLock)
        }

        const clean = (el: HTMLCanvasElement) => {
                if (!el) return
                const isSP = window.innerWidth <= 768
                if (isSP) return
                window.removeEventListener('keyup', onKeyUp)
                window.removeEventListener('keydown', onKeyDown)
                document.removeEventListener('pointerlockchange', onLock)
        }

        return { mode, node, cam, render, resize, mount, clean, mousedown, mousemove, pt: 0 }
}

const Canvas = ({ viewer }: any) => {
        const gl = useGL({
                precision: 'highp',
                // wireframe: true,
                // isDebug: true,
                isWebGL: true,
                isDepth: true,
                triangleCount: 12, // Total number of cube triangles
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
                        viewer.mount(gl.el)
                },
                clean() {
                        viewer.clean(gl.el)
                },
                dragStart(drag) {
                        viewer.mousedown(drag)
                },
                dragging(drag) {
                        viewer.mousemove(drag)
                },
        })
        return <canvas ref={gl.ref} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }} />
}

export default function Home() {
        const [viewer, set] = useState()
        useEffect(() => void createViewer().then(set as any), [])
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
