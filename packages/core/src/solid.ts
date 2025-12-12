import { createGL, isGL } from './index'
import type { GL } from './types'
export * from './index'

export const onGL = (props?: Partial<GL>, ...other: Partial<GL>[]) => {
        const gl = isGL(props) ? props : createGL(props)
        other.forEach((p) => {
                const { ref, render } = isGL(p) ? p : createGL(p)
                gl({ ref, render })
        })
        return gl
}
