import { useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik'
import { gl } from './index'
import type { GL } from './types' // @ts-ignore
import type { Fun } from 'reev/types'

export const useGL = (props?: any, self = gl as unknown as GL) => {
        const ref = useSignal<Element>()
        useVisibleTask$(({ cleanup }) => {
                self(props)
                self.el = self.target = ref.value
                self.gl = self.target.getContext('webgl2')
                self.init()
                self.resize()
                self.frame.start()
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

export const useTexture = (props: any, self = gl) => {
        return self?.texture(props)
}

export const useAttribute = (props: any, self = gl) => {
        return self.attribute(props)
}

export const useUniform = (props: any, self = gl) => {
        return self.uniform(props)
}

export const useFrame = (fun: Fun, self = gl) => {
        useTask$(() => self.frame(fun))
        return self
}
