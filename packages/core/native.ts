import { useEffect, useMemo } from 'react'
import { Dimensions } from 'react-native'
import { useMutable } from 'reev/react'
import { gl, createTF } from './index'
import { frame } from 'refr'
import type { GL } from './types'
import type { Fun } from 'refr'

export const useGL = (props: Partial<GL> = {}, self = gl) => {
        const change = () => {
                self.resize(
                        void 0,
                        self.gl.drawingBufferWidth,
                        self.gl.drawingBufferHeight
                )
        }
        const memo1 = useMutable(props) as Partial<GL>
        const memo2 = useMutable({
                ref(gl: any) {
                        self.el = {}
                        self.gl = gl
                        self.mount()
                },
                mount() {
                        self.init()
                        change()
                        frame.start()
                        Dimensions.addEventListener('change', change)
                },
                clean() {
                        self(memo2)(memo1)
                        frame.cancel()
                },
        }) as Partial<GL>

        useEffect(() => self.clean, [self])

        return useMemo(() => self(memo2)(memo1), [self, memo2, memo1])
}
export const useTF = (props: Partial<GL>, self = gl) => {
        const memo = useMutable(props) as Partial<GL>
        const tf = useMemo(() => createTF(memo, self), [memo, self])
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
        const ref = useMutable(fun)
        useEffect(() => self.frame(fun), [])
        useEffect(() => () => self.frame(ref), [])
        return self
}
