import { useEffect, useMemo } from 'react'
import { Dimensions } from 'react-native'
import { useMutable } from 'reev/react'
import { gl } from './index'
import { frame } from 'refr'
import type { GL } from './types'
import type { Fun } from 'refr'

export const useGLEvent = <T>(props: Partial<GL & T> = {}, self = gl) => {
        const memo = useMutable(props) as Partial<GL>
        return useMemo(() => self(memo), [])
}

export const useGL = (props: Partial<GL> = {}, self = gl) => {
        const memo = useMutable(props) as Partial<GL>
        return useGLEvent({
                ref(gl: any) {
                        self(memo)
                        self.el = {}
                        self.gl = gl
                        self.mount()
                },
                mount() {
                        const {
                                drawingBufferWidth: width,
                                drawingBufferHeight: height,
                        } = self.gl
                        self.size = [width, height]
                        self.init()
                        self.resize(void 0, width, height)
                        Dimensions.addEventListener('change', self.change)
                        frame.start()
                },
                clean() {
                        frame.cancel()
                },
                change() {
                        const {
                                drawingBufferWidth: width,
                                drawingBufferHeight: height,
                        } = self.gl
                        self.resize(void 0, width, height)
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
