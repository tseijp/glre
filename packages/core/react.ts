import { useState, useEffect, useMemo } from 'react'
import { gl } from './index'
import { frame } from 'refr'
import { mutable } from 'reev'
import type { GL } from './types'
import type { Fun } from 'refr'
import type { MutableArgs } from 'reev/types'

export const useMutable = <T extends object>(...args: MutableArgs<T>) => {
        const [memo] = useState(() => mutable<T>())
        return memo(...args)
}

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
                        window.addEventListener('mousemove', self.mousemove)
                },
                clean() {
                        self(memo2)(memo1)
                        frame.cancel()
                        window.removeEventListener('resize', self.resize)
                        window.removeEventListener('mousemove', self.mousemove)
                },
        }) as Partial<GL>

        return useMemo(() => self(memo2)(memo1), [self, memo1, memo2])
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
