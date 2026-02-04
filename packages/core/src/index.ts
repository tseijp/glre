import { durable, event } from 'reev'
import { dragEvent } from 'reev/gesture/drag'
import { createFrame, createQueue } from 'refr'
import { is } from './helpers'
import { webgl } from './webgl'
import { webgpu } from './webgpu'
import type { EventState } from 'reev'
import type { GL } from './types'

export * from './types'
export * from './webgl'
export * from './webgpu'

export const isServer = () => {
        return typeof window === 'undefined'
}

export const isWebGPUSupported = () => {
        if (isServer()) return false
        return 'gpu' in navigator
}

const findElement = (arg: Partial<GL>) => arg.el || arg.elem || arg.element

const collectArg = (a: GL, b: Partial<GL>) => {
        a.fs = b.fs || b.frag || b.fragment || undefined
        a.cs = b.cs || b.comp || b.compute || undefined
        a.vs = b.vs || b.vert || b.vertex || undefined
        a.uniforms = b.uniforms || undefined
        a.textures = b.textures || undefined
        a.storages = b.storages || undefined
        a.instances = b.instances || undefined
        a.attributes = b.attributes || undefined
        a.triangleCount = b.triangleCount || 2
        a.instanceCount = b.instanceCount || 1
        a.particleCount = b.particleCount || 1024
        a.count = b.count || a.triangleCount * 3 || 6
}

export const createGL = (...args: Partial<GL>[]): EventState<GL> => {
        const drag = dragEvent<HTMLCanvasElement>({
                drag() {
                        drag.event.preventDefault()
                        const [x, y] = drag.value
                        const rect = gl.el.getBoundingClientRect()
                        gl.mouse[0] = (x - rect.left) / rect.width
                        gl.mouse[1] = -(y - rect.top) / rect.height + 1
                        gl.offset[0] = drag.offset[0] / rect.width
                        gl.offset[1] = drag.offset[1] / rect.height
                        gl.uniform('iMouse', gl.mouse)
                        gl.uniform('iDrag', gl.offset)
                        gl.drag?.(drag)
                },
                dragStart() {
                        gl.dragStart?.(drag)
                },
                dragging() {
                        gl.dragging?.(drag)
                },
                dragEnd() {
                        gl.dragEnd?.(drag)
                },
        })

        const gl = event({
                isNative: false,
                isWebGL: true,
                isError: false,
                isLoop: true,
                isDebug: false,
                isDepth: false,
                wireframe: false,
                size: [0, 0],
                mouse: [0, 0],
                offset: [0, 0],
                precision: 'highp',
                error() {
                        gl.isError = true
                        gl.isLoop = false
                        gl.clean()
                        console.warn('GLRE Error:', ...arguments)
                },
        }) as EventState<GL>

        let iTime = performance.now()
        gl.queue = createQueue()
        gl.frame = createFrame()
        gl.attribute = durable((k, v, i) => gl.queue(() => gl._attribute?.(k, v, i)), gl)
        gl.instance = durable((k, v, at) => gl.queue(() => gl._instance?.(k, v, at)), gl)
        gl.storage = durable((k, v) => gl.queue(() => gl._storage?.(k, v)), gl)
        gl.texture = durable((k, v) => gl.queue(() => gl._texture?.(k, v)), gl)
        gl.uniform = durable((k, v) => gl.queue(() => gl._uniform?.(k, v)), gl)
        gl.uniform({ iResolution: gl.size, iMouse: gl.mouse, iTime, iDrag: gl.offset })

        gl('mount', async (el: HTMLCanvasElement) => {
                gl.el = findElement(gl) || el || args.map(findElement).find(Boolean)
                const isAppend = !gl.el // Check first: canvas may unmount during WebGPU async processing
                if (isAppend && !gl.isNative) {
                        gl.el = document.createElement('canvas')
                        Object.assign(gl.el.style, { top: 0, left: 0, position: 'fixed' })
                }
                for (let i = 0; i < args.length; i++) {
                        const arg = args[i]
                        collectArg(gl, arg)
                        gl(arg)
                        if (is.bol(arg.isWebGL)) gl.isWebGL = arg.isWebGL || !isWebGPUSupported()
                        if (gl.isWebGL) webgl(gl)
                        else await webgpu(gl, i === args.length - 1)
                        if (arg.mount) arg.mount() // events added in mount phase need explicit call to execute
                }
                if (!gl.el || gl.isError) return // stop if error or canvas was unmounted during async
                gl.resize()
                gl.frame(() => {
                        gl.render()
                        return gl.isLoop
                })
                if (gl.isNative) return
                if (isAppend) document.body.appendChild(gl.el)
                window.addEventListener('resize', gl.resize)
        })

        gl('clean', () => {
                gl.frame.stop()
                if (!gl.el || gl.isNative) return
                window.removeEventListener('resize', gl.resize)
        })

        gl('ref', (el: HTMLCanvasElement | null) => {
                drag.ref(el)
                if (el) {
                        gl.el = el
                        gl.mount()
                } else gl.clean()
        })

        gl('resize', () => {
                const rect = gl.el.parentElement?.getBoundingClientRect()
                gl.size[0] = gl.el.width = gl.width || rect?.width || window.innerWidth
                gl.size[1] = gl.el.height = gl.height || rect?.height || window.innerHeight
                gl.uniform('iResolution', gl.size)
        })

        gl('render', () => {
                iTime = performance.now() / 1000
                gl.uniform('iTime', iTime)
                gl.queue.flush()
        })

        return gl
}

export default createGL
