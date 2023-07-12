import { useRef, useState } from 'react'
import { createGL } from 'glre'
import { useGL, useUniform } from 'glre/react'
import { useControls } from 'leva'
import type { GL } from 'glre/types'

export function useOnce(fun: Function) {
        const ref = useRef(false)
        if (!ref.current) {
                ref.current = true
                fun()
        }
}

export function useGLRender(frag: string, width = 960, height = 540) {
        const [self] = useState(() => createGL({ frag, width, height }))
        useGL({}, self)
        useOnce(() => {
                self('render', () => {
                        self.clear()
                        self.viewport()
                        self.drawArrays()
                        return true
                })
        })
        return self
}

export function useResizeRef(self: GL) {
        const ref = useRef<Element | null>(null)
        useOnce(() => {
                self('resize', () => {
                        self.frame(() => {
                                const w = ref.current?.clientWidth
                                const h = (w / self[0]) * self[1]
                                if (!w || w >= self.width) return
                                self.size[0] = self.el.width = w
                                self.size[1] = self.el.height = w
                                self.uniform({ iResolution: [w, w] })
                        })
                })
        })
        return ref
}

export function useOrbitControls(key: string, self: GL, y = 0) {
        useOnce(() => [
                self('render', () => {
                        const t = performance.now() / 5000
                        const x = 200 * Math.cos(t)
                        const z = 200 * Math.sin(t)
                        self.uniform({ [key]: [x, y, z] })
                }),
        ])
        return self
}

export function useUniformControls(props: any, self: GL) {
        return useUniform(useControls(props), self)
}
