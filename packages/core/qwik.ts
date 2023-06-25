import { useSignal, useTask$ } from '@builder.io/qwik'
import { gl } from './index'
import { frame } from '../refr'
import type { Fun } from '../reev/types'

export function useGL(props?: any, self = gl) {
        const ref = useSignal<Element>()
        useTask$(({ cleanup }) => {
                self(props)
                self.el = self.target = ref.value
                self.gl = self.target.getContext('webgl2')
                self.init()
                self.resize()
                frame.start()
                window.addEventListener('resize', self.resize)
                window.addEventListener('mousemove', self.mousemove)
                cleanup(() => {
                        self.clean()
                        window.removeEventListener('resize', self.resize)
                        window.removeEventListener('mousemove', self.mousemove)
                })
        })
        return self
}

export function useTexture(props: any, self = gl) {
        return self?.texture(props)
}

export function useAttribute(props: any, self = gl) {
        return self.attribute(props)
}

export function useUniform(props: any, self = gl) {
        return self.uniform(props)
}

export function useFrame(fun: Fun, self = gl) {
        useTask$(() => self.frame(fun))
        return self
}
