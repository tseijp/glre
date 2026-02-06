import { compute } from './compute'
import { graphic } from './graphic'
import { enableDepth, enableWireframe, loseContext } from './utils'
import type { GL } from '../types'

export const webgl = (gl: GL, index = 0) => {
        const isInit = !gl.context
        if (isInit) {
                const c = (gl.context = gl.el.getContext('webgl2')!)
                gl('render', () => {
                        c.viewport(0, 0, ...gl.size!)
                        if (gl.isDepth) c.clear(c.DEPTH_BUFFER_BIT)
                })
        }
        gl(compute(gl))
        gl(graphic(gl, index))
        if (isInit) {
                gl('clean', () => loseContext(gl.context))
                if (gl.wireframe) enableWireframe(gl.context)
        }
        if (gl.isDepth) enableDepth(gl.context)
}
