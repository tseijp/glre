import { gl } from 'glre'
import { createMemo, onMount, onCleanup } from 'solid-js'
import { perspective, lookAt, identity } from 'glre/utils'
import type { GL, GLConfig } from "glre/types"

export function createGL(config: Partial<GLConfig>, target?: GL) {
        const self = createMemo(() => target || gl(config))
        onMount(() => self().event('mount'))
        onCleanup(() => self().event('clean'))
        return self()
}

export function onFrame(self: GL, fun: any) {
        onMount(() => self.setFrame(fun))
}

export function setTexture(self: GL, ...args: any[]) {
        return self.setTexture(...args)
}

export function setAttribute(self: GL, ...args: any[]) {
        return self.setAttribute(...args)
}

export function setMatrixUniform(self: GL) {
        onFrame(self, () => {
                const [sx, sy] = self.size
                const m = identity()
                const v = lookAt([0, 0, 1.25])
                const p = perspective(60, sx / sy)
                self.setUniform({ m, v, p }, true)
        })
        onMount(() => {
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