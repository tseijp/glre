import { gl } from 'glre'
import { onMount, onCleanup } from 'solid-js'
import type { GL } from 'glre/types'

export function createGL(config: Partial<GL>, _gl?: GL) {
        const self = _gl || (gl.default = gl(config))
        onMount(() => self.event('mount'))
        onCleanup(() => self.event('clean'))
        return self
}

export function onFrame(fun: any, self: GL) {
        if (!self) self = gl.default
        onMount(() => self.setFrame(fun))
}

export function setTexture(props, self?: GL) {
        if (!self) self = gl.default
        return self.setTexture(props)
}

export function setAttribute(props, self?: GL) {
        if (!self) self = gl.default
        return self.setAttribute(props)
}