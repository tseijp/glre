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
                isGL: true,
                size: [0, 0],
                mouse: [0, 0],
                count: 6,
                instanceCount: 1,
                particleCount: 1024,
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
                gl.vs = gl.vs || gl.vert || gl.vertex
                gl.fs = gl.fs || gl.frag || gl.fragment
                gl.cs = gl.cs || gl.comp || gl.compute
                if (gl.isWebGL) {
                        gl((await webgl(gl)) as GL)
                } else gl((await webgpu(gl)) as GL)
                if (gl.isError) return // stop if error
                gl.resize()
                gl.frame(() => {
                        gl.loop()
                        gl.queue.flush()
                        if (gl.loading) return true // wait for textures @TODO FIX
                        gl.render()
                        return gl.isLoop
                })
                if (gl.isNative) return
                window.addEventListener('resize', gl.resize)
                gl.el.addEventListener('mousemove', gl.mousemove)
        })

        gl('clean', () => {
                gl.frame.stop()
                if (gl.isNative) return
                window.removeEventListener('resize', gl.resize)
                gl.el.removeEventListener('mousemove', gl.mousemove)
        })

        gl('resize', () => {
                const w = gl.width || window.innerWidth
                const h = gl.height || window.innerHeight
                gl.size[0] = gl.el.width = w
                gl.size[1] = gl.el.height = h
                gl.uniform('iResolution', gl.size)
        })

        gl('mousemove', (_e: any, x = _e.clientX, y = _e.clientY) => {
                const [w, h] = gl.size
                const { top, left } = gl.el.getBoundingClientRect()
                gl.mouse[0] = (x - top - w / 2) / (w / 2)
                gl.mouse[1] = -(y - left - h / 2) / (h / 2)
                gl.uniform('iMouse', gl.mouse)
        })

        gl('loop', () => {
                iTime = performance.now() / 1000
                gl.uniform('iTime', iTime)
        })

        return gl(props)
}

export default createGL
