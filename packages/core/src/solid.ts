import { onMount, onCleanup } from 'solid-js'
import { createTF, gl } from './index'
import type { GL, Fun } from './types'

export type { GL, Fun }

export const onGL = (props?: Partial<GL>, self = gl) => {
        const memo = {
                ref(target: unknown) {
                        if (target) {
                                self.target = target
                                self.mount()
                        }
                },
                mount() {
                        self.el = self.target
                        self.gl = self.target.getContext('webgl2')
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

export const onTF = (props?: Partial<GL>, self = gl) => {
        const tf = createTF(props, self)
        onMount(() => tf.mount())
        onCleanup(() => tf.clean())
        return tf
}

export const onFrame = (fun: Fun, self = gl) => {
        onMount(() => self('loop', fun))
}

export const setTexture = (props: any, self = gl) => {
        return self.texture(props)
}

export const setAttribute = (props: any, self = gl) => {
        return self.attribute(props)
}
