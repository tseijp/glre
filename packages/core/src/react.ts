/*
import { useEffect } from 'react'
import { gl } from './index'
import { useOnce, useMutable } from 'reev/react'
import type { GL, Fun } from './types'
export type { GL, Fun }

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
                        self.frame.start()
                        window.addEventListener('resize', self.resize)
                        self.el.addEventListener('mousemove', self.mousemove)
                },
                clean() {
                        self(memo2)(memo1)
                        self.frame.stop()
                        window.removeEventListener('resize', self.resize)
                },
        }) as Partial<GL>

        return useOnce(() => self(memo2)(memo1))
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
        useEffect(() => void self.queue(fun), [])
        useEffect(() => () => self.queue(fun), [])
        return self
}
*/
