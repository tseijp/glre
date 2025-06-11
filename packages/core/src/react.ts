import { useState } from 'react'
import { createGL, isGL } from './index'
import type { GL } from './types'
export * from './index'

export const useGL = (props: Partial<GL> = {}) => {
        return useState(() => {
                const gl = isGL(props) ? props : createGL(props)
                gl.ref = (el: HTMLCanvasElement | null) => {
                        if (el) {
                                gl.el = el
                                gl.gl = el.getContext('webgl2')
                                gl.mount()
                        } else gl.clean()
                }
                return gl
        })[0]
}
