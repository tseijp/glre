import { onMount, onCleanup } from 'solid-js'
import { frame } from 'refr'
import { gl } from './index'
import type { Fun } from 'reev/types'

export function createGL(props?: any, self = gl) {
        onCleanup(self.clean)
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
                        frame.start()
                        window.addEventListener('resize', self.resize)
                        window.addEventListener('mousemove', self.mousemove)
                },
                clean() {
                        self(props)(memo)
                        frame.cancel()
                        window.removeEventListener('resize', self.resize)
                        window.removeEventListener('mousemove', self.mousemove)
                },
        }
        return self(props)(memo)
}

export function onFrame(fun: Fun, self = gl) {
        onMount(() => self('render', fun))
}

export function setTexture(props: any, self = gl) {
        return self.texture(props)
}

export function setAttribute(props: any, self = gl) {
        return self.attribute(props)
}
