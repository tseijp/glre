import { compute } from './compute'
import { graphic } from './graphic'
import type { GL } from '../types'

export const webgl = (gl: GL) => {
        const c = (gl.webgl.context = gl.el!.getContext('webgl2')!)
        const cp = compute(gl, c)
        const renderers = [] as ReturnType<typeof graphic>[]
        const mainRenderer = graphic(gl, c, gl)

        renderers.push(mainRenderer)
        gl.webgl.program = mainRenderer.pg
        gl.webgl.uniforms = mainRenderer.uniforms
        if (gl.programs && gl.programs.length) gl.programs.forEach((p: any) => renderers.push(graphic(gl, c, p)))

        const _attribute = (key = '', value: number[]) => renderers.forEach((r) => r._attribute(key, value))
        const _instance = (key: string, value: number[]) => renderers.forEach((r) => r._instance(key, value))
        const _texture = (key: string, src: string) => renderers.forEach((r) => r._texture(key, src))
        const _uniform = (key: string, value: number | number[]) => {
                cp?._uniform(key, value)
                renderers.forEach((r) => r._uniform(key, value))
        }

        const clean = () => {
                cp?.clean()
                renderers.forEach((r) => r.clean())
                c.getExtension('WEBGL_lose_context')?.loseContext()
        }

        const render = () => {
                cp?.render()
                c.viewport(0, 0, ...gl.size)
                renderers.forEach((r) => r.render())
                c.bindFramebuffer(c.FRAMEBUFFER, null)
        }

        if (gl.isDepth) {
                c.enable(c.DEPTH_TEST)
                c.depthFunc(c.LEQUAL)
                c.enable(c.CULL_FACE)
                c.cullFace(c.BACK)
        }

        if (gl.wireframe) {
                const ext = c.getExtension('WEBGL_polygon_mode')
                ext.polygonModeWEBGL(c.FRONT_AND_BACK, ext.LINE_WEBGL)
        }

        return { render, clean, _attribute, _instance, _uniform, _texture, _storage: cp?._storage }
}
