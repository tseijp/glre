import { useEffect, useMemo } from 'react'
import { useMutable } from 'reev/react'
import { gl } from './index'
import { frame } from 'refr'
import type { GL } from './types'
import type { Fun } from 'refr'

export const useGLEvent = (props: Partial<GL>, self = gl) => {
        const memo = useMutable(props) as Partial<GL>
        return useMemo(() => self(memo), [])
}

export const useGL = (props: Partial<GL> = {}, self = gl) => {
        const memo = useMutable(props) as Partial<GL>
        return useGLEvent({
                ref(target: unknown) {
                        if (target) {
                                self.target = target
                                self.mount()
                        } else self.clean()
                },
                mount() {
                        self(memo)
                        self.el = self.target
                        self.gl = self.target.getContext('webgl2')
                        self.init()
                        self.resize()
                        frame.start()
                        window.addEventListener('resize', self.resize)
                        window.addEventListener('mousemove', self.mousemove)
                },
                clean() {
                        frame.cancel()
                        window.removeEventListener('resize', self.resize)
                        window.removeEventListener('mousemove', self.mousemove)
                },
        })
}

export function useTexture(props: any, self = gl) {
        return self.texture(props)
}

export function useAttribute(props: any, self = gl) {
        return self.attribute(props)
}

export function useUniform(props: any, self = gl) {
        return self.uniform(props)
}

export function useFrame(fun: Fun, self = gl) {
        const ref = useMutable(fun)
        useEffect(() => self.frame(fun), [])
        useEffect(() => () => self.frame(ref), [])
        return self
}
