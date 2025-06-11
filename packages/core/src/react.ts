import { useEffect } from 'react' // @ts-ignore
import { useOnce, useMutable } from 'reev/react'
import { defaultGL } from './index'
import type { GL, Fun } from './types'
export * from './index'

export const useGL = (props: Partial<GL> = {}, self = defaultGL) => {
        const memo1 = useMutable(props) as Partial<GL>
        const memo2 = useMutable({
                ref(el: HTMLCanvasElement | null) {
                        if (el) {
                                self.el = el
                                self.gl = el.getContext('webgl2')
                                self.mount()
                        } else self.clean()
                },
        }) as Partial<GL>

        return useOnce(() => self(memo2)(memo1))
}

export const useQueue = (fn: Fun, self = defaultGL) => {
        return self.queue(fn)
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
        useEffect(() => void self.queue(fun), [])
        useEffect(() => () => self.queue(fun), [])
        return self
}
