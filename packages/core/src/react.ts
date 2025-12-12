import { useState } from 'react'
import { createGL, isGL } from './index'
import type { GL } from './types'
export * from './index'

export const useGL = (props: Partial<GL> = {}, ...other: Partial<GL>[]) => {
        return useState(() => {
                const gl = isGL(props) ? props : createGL(props)
                if (other.length) gl({ programs: other as any })
                return gl
        })[0]
}
