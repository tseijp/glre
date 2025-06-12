import { useState } from 'react' // @ts-ignore
import { Dimensions } from 'react-native'
import { createGL, isGL } from './index'
import type { GL } from './types'
export * from './index'

export const useGL = (props: Partial<GL> = {}) => {
        return useState(() => {
                const gl = isGL(props) ? props : createGL(props)
                gl.ref = (ctx: any) => {
                        gl.el = {}
                        gl.gl = ctx
                        gl({
                                render() {
                                        ctx.flush()
                                        ctx.endFrameEXP()
                                },
                        })
                        gl.mount()
                        const resize = () => {
                                gl.width = ctx.drawingBufferWidth
                                gl.height = ctx.drawingBufferHeight
                                gl.resize()
                        }
                        resize()
                        Dimensions.addEventListener('change', resize)
                }
                return gl({ isNative: true })
        })[0]
}
