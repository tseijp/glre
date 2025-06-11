import { useEffect, useMemo } from 'react'
import { Dimensions } from 'react-native' // @ts-ignore
import { useMutable } from 'reev/react'
import { defaultGL } from './index'
import type { GL, Fun } from './types'
export * from './index'

export const useGL = (props: Partial<GL> = {}, self = defaultGL) => {
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
                        change()
                        Dimensions.addEventListener('change', change)
                },
        }) as Partial<GL>

        useEffect(() => self.clean, [self])

        return useMemo(() => self(memo2)(memo1), [self, memo2, memo1])
}

export const useTexture = (props: any, self = defaultGL) => {
        return self.texture(props)
}

export const useAttribute = (props: any, self = defaultGL) => {
        return self.attribute(props)
}

export const useUniform = (props: any, self = defaultGL) => {
        return self.uniform(props)
}

export const useFrame = (fun: Fun, self = defaultGL) => {
        const ref = useMutable(fun)
        useEffect(() => self.frame(fun), [])
        useEffect(() => () => self.frame(ref), [])
        return self
}
