import { compute } from './compute'
import { graphic } from './graphic'
import { enableDepth, enableWireframe, loseContext } from './utils'
import type { GL } from '../types'

export const webgl = (gl: GL) => {
        const isInit = !gl.context
        if (isInit) {
                const c = (gl.context = gl.el.getContext('webgl2')!)
                gl('render', () => c.viewport(0, 0, ...gl.size!)) // Run before other renderers' events to prevent flickering
        }
        gl(compute(gl))
        gl(graphic(gl))
        if (isInit) {
                gl('clean', () => loseContext(gl.context))
                if (gl.isDepth) enableDepth(gl.context)
                if (gl.wireframe) enableWireframe(gl.context)
        }
}
