import { onMount, onCleanup } from 'solid-js'
import { defaultGL } from './index'
import type { GL, Fun } from './types'
export * from './index'

export const onGL = (props?: Partial<GL>, self = defaultGL) => {
        const memo = {
                ref(el: HTMLCanvasElement | null) {
                        if (!el) return
                        self.el = el
                        self.gl = el.getContext('webgl2')
                        self.mount()
                },
                mount() {
                        self.init()
                        self.resize()
                        self.frame.start()
                        window.addEventListener('resize', self.resize)
                        window.addEventListener('mousemove', self.mousemove)
                },
                clean() {
                        self(props)(memo)
                        self.frame.stop()
                        window.removeEventListener('resize', self.resize)
                        window.removeEventListener('mousemove', self.mousemove)
                },
        }
        onCleanup(self.clean)
        return self(props)(memo)
}

export const onFrame = (fun: Fun, self = defaultGL) => {
        onMount(() => self('loop', fun))
}

export const setTexture = (props: any, self = defaultGL) => {
        return self.texture(props)
}

export const setAttribute = (props: any, self = defaultGL) => {
        return self.attribute(props)
}
