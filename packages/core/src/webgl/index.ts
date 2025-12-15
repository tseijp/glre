import { compute } from './compute'
import { graphic } from './graphic'
import type { GL } from '../types'

export const webgl = (gl: GL, ...args: Partial<GL>[]) => {
        const c = (gl.context = gl.el!.getContext('webgl2')!)

        if (gl.isDepth) {
                c.enable(c.DEPTH_TEST)
                c.depthFunc(c.LEQUAL)
                c.enable(c.CULL_FACE)
                c.cullFace(c.BACK)
        }

        if (gl.wireframe) {
                const ext = c.getExtension('WEBGL_polygon_mode')
                if (ext) ext.polygonModeWEBGL(c.FRONT_AND_BACK, ext.LINE_WEBGL)
        }

        gl('clean', () => {
                const ext = c.getExtension('WEBGL_lose_context')
                if (ext) ext.loseContext()
        })

        gl('render', () => {
                c.bindFramebuffer(c.FRAMEBUFFER, null) // ??
                c.viewport(0, 0, ...gl.size!)
        })

        args.forEach((arg) => {
                gl.cs = arg.cs || arg.comp || arg.compute || void 0
                gl.vs = arg.vs || arg.vert || arg.vertex || void 0
                gl.fs = arg.fs || arg.frag || arg.fragment || void 0
                gl.triangleCount = arg.triangleCount || arg.count || 6
                gl.instanceCount = arg.instanceCount || 1
                gl.particleCount = arg.particleCount || 1024
                compute(c, gl(arg))
                graphic(c, gl(arg))
        })
}

export type WebGLRenderer = ReturnType<typeof webgl>
