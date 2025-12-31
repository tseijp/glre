import { durable, event } from 'reev'
import { createFrame, createQueue } from 'refr'
import { is } from './helpers'
import { webgl } from './webgl'
import { webgpu } from './webgpu'
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

const isPointerEventsSupported = () => {
        if (isServer()) return false
        return 'PointerEvent' in window
}

const isTouchDevice = () => {
        if (isServer()) return false
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0
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
                drag: [0, 0],
                precision: 'highp',
                error() {
                        gl.isError = true
                        gl.isLoop = false
                        gl.clean()
                        console.warn('GLRE Error:', ...arguments)
                },
        }) as EventState<GL>

        let iTime = performance.now()
        let isDragging = false
        let lastPointer = [0, 0]
        gl.queue = createQueue()
        gl.frame = createFrame()

        const startDrag = (x: number, y: number) => {
                isDragging = true
                lastPointer[0] = x
                lastPointer[1] = y
        }

        const updateDrag = (x: number, y: number) => {
                if (!isDragging) return
                const dx = x - lastPointer[0]
                const dy = y - lastPointer[1]
                const rect = gl.el.getBoundingClientRect()
                gl.drag[0] += dx / rect.width
                gl.drag[1] -= dy / rect.height
                gl.uniform('iDrag', gl.drag)
                lastPointer[0] = x
                lastPointer[1] = y
        }

        const stopDrag = () => {
                isDragging = false
        }

        gl.attribute = durable((k, v, i) => gl.queue(() => gl._attribute?.(k, v, i)), gl)
        gl.instance = durable((k, v, at) => gl.queue(() => gl._instance?.(k, v, at)), gl)
        gl.storage = durable((k, v) => gl.queue(() => gl._storage?.(k, v)), gl)
        gl.texture = durable((k, v) => gl.queue(() => gl._texture?.(k, v)), gl)
        gl.uniform = durable((k, v) => gl.queue(() => gl._uniform?.(k, v)), gl)
        gl.uniform({ iResolution: gl.size, iMouse: [0, 0], iDrag: [0, 0], iTime })

        gl('mount', async (el: HTMLCanvasElement) => {
                gl.el = findElement(gl) || el || args.map(findElement).find(Boolean)
                const isAppend = !gl.el // Check first: canvas may unmount during WebGPU async processing
                if (isAppend && !gl.isNative) {
                        gl.el = document.createElement('canvas')
                        Object.assign(gl.el.style, { top: 0, left: 0, position: 'fixed' })
                }
                for (let i = 0; i < args.length; i++) {
                        const arg = args[i]
                        gl.fs = arg.fs || arg.frag || arg.fragment || undefined
                        gl.cs = arg.cs || arg.comp || arg.compute || undefined
                        gl.vs = arg.vs || arg.vert || arg.vertex || undefined
                        gl.triangleCount = arg.triangleCount || 2
                        gl.instanceCount = arg.instanceCount || 1
                        gl.particleCount = arg.particleCount || 1024
                        gl.count = arg.count || gl.triangleCount * 3 || 6
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
                const prefix = isPointerEventsSupported() ? 'pointer' : isTouchDevice() ? 'touch' : 'mouse'
                const isTouchMode = prefix === 'touch'
                const moveEvent = prefix + 'move'
                const downEvent = isTouchMode ? 'touchstart' : prefix + 'down'
                const upEvent = isTouchMode ? 'touchend' : prefix + 'up'
                gl.el.addEventListener(moveEvent, isTouchMode ? gl._touchmove : gl.mousemove)
                gl.el.addEventListener(downEvent, gl.mousedown)
                gl.el.addEventListener(upEvent, gl.mouseup)
                if (!isTouchMode) {
                        document.addEventListener(moveEvent, gl._drag)
                        document.addEventListener(upEvent, gl.mouseup)
                }
        })

        gl('clean', () => {
                gl.frame.stop()
                if (!gl.el || gl.isNative) return
                window.removeEventListener('resize', gl.resize)
                const prefix = isPointerEventsSupported() ? 'pointer' : isTouchDevice() ? 'touch' : 'mouse'
                const isTouchMode = prefix === 'touch'
                const moveEvent = prefix + 'move'
                const downEvent = isTouchMode ? 'touchstart' : prefix + 'down'
                const upEvent = isTouchMode ? 'touchend' : prefix + 'up'
                gl.el.removeEventListener(moveEvent, isTouchMode ? gl._touchmove : gl.mousemove)
                gl.el.removeEventListener(downEvent, gl.mousedown)
                gl.el.removeEventListener(upEvent, gl.mouseup)
                if (!isTouchMode) {
                        document.removeEventListener(moveEvent, gl._drag)
                        document.removeEventListener(upEvent, gl.mouseup)
                }
        })

        gl('ref', (el: HTMLCanvasElement | null) => {
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

        gl('mousemove', (_e: any, x = _e.clientX, y = _e.clientY) => {
                const rect = gl.el.getBoundingClientRect()
                gl.mouse[0] = (x - rect.left) / rect.width
                gl.mouse[1] = -(y - rect.top) / rect.height + 1
                gl.uniform('iMouse', gl.mouse)
        })

        gl('mousedown', (_e: any) => {
                _e.preventDefault()
                const isPointer = 'pointerId' in _e
                const touch = _e.touches?.[0]
                const x = touch?.clientX ?? _e.clientX
                const y = touch?.clientY ?? _e.clientY
                if (isPointer) gl.el.setPointerCapture(_e.pointerId)
                startDrag(x, y)
        })

        gl('mouseup', (_e: any) => {
                const isPointer = 'pointerId' in _e
                if (isDragging && isPointer && gl.el) gl.el.releasePointerCapture(_e.pointerId)
                stopDrag()
        })

        gl('_drag', (_e: any) => {
                const touch = _e.touches?.[0]
                const x = touch?.clientX ?? _e.clientX
                const y = touch?.clientY ?? _e.clientY
                updateDrag(x, y)
        })

        gl('_touchmove', (_e: TouchEvent) => {
                if (_e.touches.length === 0) return
                const touch = _e.touches[0]
                gl.mousemove(_e, touch.clientX, touch.clientY)
                gl._drag(_e)
        })

        gl('render', () => {
                iTime = performance.now() / 1000
                gl.uniform('iTime', iTime)
                gl.queue.flush()
        })

        return gl
}

export default createGL
