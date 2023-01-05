import { event } from 'reev'
import {  createProgram, createShader } from './graphics'

export const glEvent = (self: GL, target: any = "") => event({
        mount(e) {
                const el = (self.el = target.current || document.getElementById(target))
                const gl = (self.gl = el?.getContext("webgl"))
                const frag = createShader(gl, self.fragShader, gl?.FRAGMENT_SHADER)
                const vert = createShader(gl, self.vertShader, gl?.VERTEX_SHADER)
                self.pg = createProgram(gl, vert, frag) // !!!
                window.addEventListener("resize", e.on("resize"))
                window.addEventListener("mousemove", e.on("mousemove"))
                e("resize")
                self.frame()
        },
        clean(e) {
                window.removeEventListener("resize", e.on("resize"))
                window.removeEventListener("mousemove", e.on("mousemove"))
        },
        mousemove(_e, { clientX, clientY }, ...args) {
                const [w, h] = self.size
                self.mouse[0] = (clientX - w / 2) / (w / 2)
                self.mouse[1] = -(clientY - h / 2) / (h / 2)
                self.setUniform("mouse", self.mouse)
        },
        resize(_e, _resizeEvent, width = 0, height = 0) {
                self.size[0] = self.el.width = width || window.innerWidth
                self.size[1] = self.el.height = height || window.innerHeight
                self.setUniform("resolution", self.size)
        }
})
