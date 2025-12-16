import { durable, event } from 'reev'
import { createFrame, createQueue } from 'refr'
import { is } from './helpers'
import { webgl } from './webgl'
import type { EventState } from 'reev'
import type { GL } from './types'
export * from './types'

export const isServer = () => {
        return typeof window === 'undefined'
}

export const isWebGPUSupported = () => {
        if (isServer()) return false
        return 'gpu' in navigator
}

const findElement = (arg: Partial<GL>) => {
        return arg.el || arg.elem || arg.element
}

export const createGL = (...args: Partial<GL>[]) => {
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
                precision: 'highp',
                loading: 0,
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
        gl.uniform({ iResolution: gl.size, iMouse: [0, 0], iTime })

        gl('mount', async (el: HTMLCanvasElement) => {
                if (is.bol(args[0].isWebGL)) gl.isWebGL = args[0].isWebGL
                if (!isWebGPUSupported()) gl.isWebGL = true
                gl.el = findElement(gl) || el || args.map(findElement)[0]
                const isCreated = !gl.el // Check first: canvas may unmount during WebGPU async processing
                if (isCreated && !gl.isNative) gl.el = document.createElement('canvas')
                for (const arg of args) {
                        gl.cs = arg.cs || arg.comp || arg.compute || void 0
                        gl.vs = arg.vs || arg.vert || arg.vertex || void 0
                        gl.fs = arg.fs || arg.frag || arg.fragment || void 0
                        gl.triangleCount = arg.triangleCount || arg.count || 6
                        gl.instanceCount = arg.instanceCount || 1
                        gl.particleCount = arg.particleCount || 1024
                        gl(arg)
                        if (is.bol(arg.isWebGL)) gl.isWebGL = arg.isWebGL || !isWebGPUSupported()
                        if (gl.isWebGL) webgl(gl)
                        // else await webgpu(gl)
                        if (arg.mount) arg.mount() // events added in mount phase need explicit call to execute
                }
                if (!gl.el || gl.isError) return // stop if error or canvas was unmounted during async
                gl.resize()
                gl.frame(() => {
                        if (gl.loading) return true // wait for textures loading @TODO FIX
                        gl.render()
                        return gl.isLoop
                })
                if (gl.isNative) return
                if (isCreated) document.body.appendChild(gl.el)
                window.addEventListener('resize', gl.resize)
                gl.el.addEventListener('mousemove', gl.mousemove)
        })

        gl('clean', () => {
                gl.frame.stop()
                if (!gl.el || gl.isNative) return
                window.removeEventListener('resize', gl.resize)
                gl.el.removeEventListener('mousemove', gl.mousemove)
        })

        gl('ref', (el: HTMLCanvasElement | null) => {
                if (el) {
                        gl.el = el
                        gl.mount()
                } else gl.clean()
        })

        gl('resize', () => {
                const rect = gl.el.parentElement?.getBoundingClientRect()
                gl.size[0] = gl.el.width = gl.width ?? rect?.width ?? window.innerWidth
                gl.size[1] = gl.el.height = gl.height ?? rect?.height ?? window.innerWidth
                gl.uniform('iResolution', gl.size)
        })

        gl('mousemove', (_e: any, x = _e.clientX, y = _e.clientY) => {
                const rect = gl.el.getBoundingClientRect()
                gl.mouse[0] = (x - rect.left) / rect.width
                gl.mouse[1] = -(y - rect.top) / rect.height + 1
                gl.uniform('iMouse', gl.mouse)
        })

        gl('render', () => {
                iTime = performance.now() / 1000
                gl.uniform('iTime', iTime)
                gl.queue.flush()
        })

        return gl
}

export default createGL
