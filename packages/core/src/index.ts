import { durable, event } from 'reev'
import { createFrame, createQueue } from 'refr'
import { is } from './utils/helpers'
import { webgl } from './utils/webgl'
import { webgpu } from './utils/webgpu'
import type { EventState } from 'reev'
import type { GL } from './types'
export * from './types'

export const isGL = (a: unknown): a is EventState<GL> => {
        if (!is.obj(a)) return false
        if ('isGL' in a) return true
        return false
}

export const isServer = () => {
        return typeof window === 'undefined'
}

export const isWebGPUSupported = () => {
        if (isServer()) return false
        return 'gpu' in navigator
}

let iTime = performance.now()

export const createGL = (props?: Partial<GL>) => {
        const gl = event({
                isNative: false,
                isWebGL: true,
                isError: false,
                isLoop: true,
                isDebug: false,
                isDepth: false,
                wireframe: false,
                isGL: true,
                size: [0, 0],
                mouse: [0, 0],
                count: 6,
                instanceCount: 1,
                particleCount: 1024,
                precision: 'highp',
                webgl: {},
                webgpu: {},
                loading: 0,
                error() {
                        gl.isError = true
                        gl.isLoop = false
                        gl.clean()
                        console.warn('GLRE Error:', ...arguments)
                },
        }) as EventState<GL>

        gl.queue = createQueue()
        gl.frame = createFrame()

        gl.attribute = durable((k, v, i) => gl.queue(() => gl._attribute?.(k, v, i)), gl)
        gl.instance = durable((k, v, at) => gl.queue(() => gl._instance?.(k, v, at)), gl)
        gl.storage = durable((k, v) => gl.queue(() => gl._storage?.(k, v)), gl)
        gl.uniform = durable((k, v) => gl.queue(() => gl._uniform?.(k, v)), gl)
        gl.texture = durable((k, v) => gl.queue(() => gl._texture?.(k, v)), gl)
        gl.uniform({ iResolution: gl.size, iMouse: [0, 0], iTime })

        gl('mount', async () => {
                if (!isWebGPUSupported()) gl.isWebGL = true
                gl.el = gl.el || gl.elem || gl.element
                gl.vs = gl.vs || gl.vert || gl.vertex
                gl.fs = gl.fs || gl.frag || gl.fragment
                gl.cs = gl.cs || gl.comp || gl.compute
                const isCreated = !gl.el // Check first: canvas may unmount during WebGPU async processing
                if (isCreated && !gl.isNative) gl.el = document.createElement('canvas')
                if (gl.isWebGL) {
                        gl(webgl(gl) as GL)
                } else gl((await webgpu(gl)) as GL)
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
                gl.el?.addEventListener('mousemove', gl.mousemove)
        })

        gl('clean', () => {
                gl.frame.stop()
                if (gl.isNative) return
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

        return gl(props)
}

export default createGL
