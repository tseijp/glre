import { gl } from './index'
import type { GL } from './types'
import { useRef, useMemo, useEffect, useCallback } from 'react'

export function useGL(config?: Partial<GL>, target?: GL) {
        const self = useMemo(() => {
                if (target) return target
                return (gl.default = gl(target))
        }, [target])
        useEffect(() => void self.setConfig(config), [self, config])
        useEffect(() => void self.event.mount(), [self])
        useEffect(() => () => self.event.clean(), [self])
        return self
}

export function useTexture(props, self?: GL) {
        if (!self) self = gl.default
        useEffect(() => void self?.setTexture(props), [props, self])
}

export function useAttribute(props, self?: GL) {
        if (!self) self = gl.default
        return self.setAttribute(props)
}

export function useUniform(props, self?: GL) {
        if (!self) self = gl.default
        return self.setUniform(props)
}

export function useFrame(fun, self?: GL) {
        if (!self) self = gl.default
        const ref = useMutable(fun)
        useEffect(() => void self?.setFrame(ref), [ref, self])
}

export function useMutable(fun) {
        const ref = useRef(fun)
        return useCallback(() => ref.current(), [])
}
