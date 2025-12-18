import { useState } from 'react'
import { createGL } from './index'
import type { GL } from './types'
export * from './index'

export const useGL = (...args: Partial<GL>[]) => {
        return useState(() => {
                const gl = createGL(...args)
                gl.isNative = true
                gl.ref = (ctx: any) => {
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
                        // Dimensions.addEventListener('change', resize)
                }
                return gl()
        })[0]
}
