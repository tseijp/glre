import { event } from 'reev'
import { createFrame, createQueue } from 'refr'
import { webgl } from './webgl/index'
import { webgpu } from './webgpu/index'
import { isWebGPUSupported } from './utils'
import type { GL } from './types'
export * from './code/glsl'
export * from './code/wgsl'
export * from './node'
export * from './types'
export * from './utils'
export * from './webgl'
export * from './webgpu'

let iTime = performance.now(),
        iPrevTime = 0,
        iDeltaTime = 0

// 共通レンダラーベース
export const createGL = (props?: Partial<GL>) => {
        const self = event<Partial<GL>>({
                isNative: false,
                isWebGL: true,
                isLoop: true,
                size: [0, 0],
                mouse: [0, 0],
                count: 6,
                counter: 0,
                ...props,
        }) as GL

        self.queue = createQueue()
        self.frame = createFrame()

        self('mount', () => {
                if (!isWebGPUSupported()) self.isWebGL = true
                if (self.isWebGL) {
                        webgl(self)
                } else webgpu(self)
                self.resize()
                self.frame(() => {
                        self.render()
                        return self.isLoop
                })
                if (self.isNative) return
                window.addEventListener('resize', self.resize)
                self.el.addEventListener('mousemove', self.mousemove)
        })

        self('clean', () => {
                self.frame.stop()
                self.frame.clean(self.render)
                if (self.isNative) return
                window.removeEventListener('resize', self.resize)
                self.el.removeEventListener('mousemove', self.mousemove)
        })

        self('render', () => {
                iPrevTime = iTime
                iTime = performance.now() / 1000
                iDeltaTime = iTime - iPrevTime
                self.uniform({ iPrevTime, iTime, iDeltaTime })
                // if (self.fragmentNode) updateUniforms({ time: iTime }) // @TODO FIX
        })

        self('resize', () => {
                const w = self.width || window.innerWidth
                const h = self.height || window.innerHeight
                self.size[0] = self.el.width = w
                self.size[1] = self.el.height = h
                self.uniform('iResolution', self.size)
        })

        self('mousemove', (_e: any, x = _e.clientX, y = _e.clientY) => {
                const [w, h] = self.size
                const { top, left } = self.el.getBoundingClientRect()
                self.mouse[0] = (x - top - w / 2) / (w / 2)
                self.mouse[1] = -(y - left - h / 2) / (h / 2)
                self.uniform('iMouse', self.mouse)
        })

        return self
}

export const defaultGL = createGL()
export default defaultGL
