import { useEffect } from 'react'
import { createTF, gl } from './index'
import { frame } from 'refr' // @ts-ignore
import { useOnce, useMutable } from 'reev/react'
import type { GL } from './types'
import type { Fun } from 'refr'

export const useGL = (props: Partial<GL> = {}, self = gl) => {
        const memo1 = useMutable(props) as Partial<GL>
        const memo2 = useMutable({
                ref(target: unknown) {
                        if (target) {
                                self.target = target
                                self.mount()
                        } else self.clean()
                },
                mount() {
                        self.el = self.target
                        self.gl = self.target.getContext('webgl2')
                        self.init()
                        self.resize()
                        frame.start()
                        window.addEventListener('resize', self.resize)
                        self.el.addEventListener('mousemove', self.mousemove)
                },
                clean() {
                        self(memo2)(memo1)
                        frame.cancel()
                        window.removeEventListener('resize', self.resize)
                },
        }) as Partial<GL>

        return useOnce(() => self(memo2)(memo1))
}

export const useTF = (props: Partial<GL>, self = gl) => {
        const memo = useMutable(props) as Partial<GL>
        const tf = useOnce(() => createTF(memo, self))
        useEffect(() => void tf.mount() || tf.clean, [self])
        return tf
}

export const useTexture = (props: any, self = gl) => {
        return self.texture(props)
}

export const useAttribute = (props: any, self = gl) => {
        return self.attribute(props)
}

export const useUniform = (props: any, self = gl) => {
        return self.uniform(props)
}

export const useFrame = (fun: Fun, self = gl) => {
        useEffect(() => void self.frame(fun), [])
        useEffect(() => () => self.frame(fun), [])
        return self
}
