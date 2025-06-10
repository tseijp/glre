import { event } from 'reev'
import type { GL, Fun } from './types'
export type { GL, Fun }

// 共通レンダラーベース
export const base = (props?: Partial<GL>) => {
        const resize = (
                _e: any,
                width = self.width || window.innerWidth,
                height = self.height || window.innerHeight
        ) => {
                self.size[0] = self.el.width = width
                self.size[1] = self.el.height = height
                self.uniform('iResolution', self.size)
        }

        const mousemove = (_e: any, x = _e.clientX, y = _e.clientY) => {
                const [w, h] = self.size
                const { top, left } = self.el.getBoundingClientRect()
                self.mouse[0] = (x - top - w / 2) / (w / 2)
                self.mouse[1] = -(y - left - h / 2) / (h / 2)
                self.uniform('iMouse', self.mouse)
        }

        // @TODO FIX
        const load = (_: any, image: any) => {
                // WebGL/WebGPU共通のテクスチャ処理
        }

        const clear = (key = 'COLOR_BUFFER_BIT') => {
                if (self.renderer === 'webgl') self.gl.clear(self.gl[key])
        }

        const viewport = (size: number[] = self.size) => {
                if (self.renderer === 'webgl') self.gl.viewport(0, 0, ...size)
        }

        const drawArrays = (mode = 'TRIANGLES') => {
                if (self.renderer === 'webgl') {
                        self.gl.drawArrays(self.gl[mode], 0, self.count)
                }
        }

        const self = event<Partial<GL>>({
                ...props,
                size: [0, 0],
                mouse: [0, 0],
                count: 6,
                counter: 0,
                resize,
                mousemove,
                load,
                clear,
                viewport,
                drawArrays,
        }) as GL

        return self
}
