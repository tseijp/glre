import { gl } from 'glre'
import { useRef, useMemo, useEffect } from 'react'
import { perspective, lookAt, identity } from 'glre/utils'
import type { GL, GLConfig } from "glre/types"

export function useGL(config: Partial<GLConfig>, target?: GL) {
        const self = useMemo(() => target || gl(config), [target, config])
        useEffect(() => void self.event('mount'), [self])
        useEffect(() => () => self.event('clean'), [self])
        return self
}

export function useTexture(self: GL, ...args: any[]) {
        return self.setTexture(...args)
}

export function useAttribute(self: GL, ...args: any[]) {
        return self.setAttribute(...args)
}

export function useFrame(self: GL, fun: any) {
        const ref = useRef(fun)
        useEffect(() => self.setFrame(ref.current), [self])
}

export function useMatrixUniform(self: GL) {
        useFrame(self, () => {
                const [sx, sy] = self.size
                const m = identity()
                const v = lookAt([0, 0, 1.25])
                const p = perspective(60, sx / sy)
                self.setUniform({ m, v, p }, true)
        })
        useEffect(() => {
                self.event.mount({
                        mousemove() {
                                const [mx, my] = self.mouse
                                self.setUniform('v', lookAt([-mx * 3, -my * 3, 1.25]), true)
                        },
                        resize() {
                                const [sx, sy] = self.size
                                self.setUniform('p', perspective(60, sx / sy), true)
                        }
                })
        }, [self])
}