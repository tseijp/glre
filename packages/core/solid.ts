import { createMemo, onMount, onCleanup } from 'solid-js'
import { frame } from '../refr'
import { gl } from './index'
import type { Fun } from '../reev/types'

export function createGLEvent(props?: any, self = gl) {
        const memo = createMemo<any>(() => props)
        onCleanup(() => void (self.clean(), self(memo())))
        return self(memo())
}

export function createGL(props?: any, self = gl) {
        const memo = createMemo<any>(() => props)
        return createGLEvent({
                mount() {
                        self(memo())
                        self.el = self.target
                        self.gl = self.target.getContext('webgl2')
                        self.init()
                        self.resize()
                        frame.start()
                        window.addEventListener('resize', self.resize)
                        window.addEventListener('mousemove', self.mousemove)
                        let iTime = performance.now(),
                                iPrevTime = 0,
                                iDeltaTime = 0
                        self('render', () => {
                                iPrevTime = iTime
                                iTime = performance.now() / 1000
                                iDeltaTime = iTime - iPrevTime
                                self.uniform({ iTime, iPrevTime, iDeltaTime })
                        })
                },
                clean() {
                        window.removeEventListener('resize', self.resize)
                        window.removeEventListener('mousemove', self.mousemove)
                },
        })
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
