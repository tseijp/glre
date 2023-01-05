import { atom } from 'reii'
import { frame } from 'refr'
import { nested } from 'reev'
import { glEvent } from './events'
import { getLocation, getType, getStride, createIbo, createVbo } from './helpers'
import type { GL, GLConfig } from '@glre/types'

export default gl

export function gl(target = "", config: GLConfig = {}) {
        const { mouse = [0, 0], size = [0, 0] } = config
        const self = ((arg = "") => {
                if (typeof arg === "string") return self.frag(arg)
                if (typeof arg === "function") return self.frame.mount(arg)
        }) as GL
        /**
         * initial value
         */
        self.size = size
        self.mouse = mouse
        self.target = target
        /**
         * core state
        */
        self.event = glEvent(self, target)
        self.frame = frame()
        self.uniform = nested(atom)
        self.attribute = nested(atom) // @ts-ignore
        self.location = nested((...args) => getLocation(self.gl, self.pg, ...args))
        /**
         * setter
         */
        self.frag = (shader) => void (self.fragShader = shader) || self // !!!
        self.vert = (shader) => void (self.vertShader = shader) || self // !!!
        self.setDpr = (...args) => self.event("resize", ...args) || self
        self.setSize = (...args) => self.event("resize", ...args) || self
        self.setUniform = (key, value) => {
                self.frame.mount(() => void self.uniform(key).flush(value))
                if (self.uniform.has(key)) return
                self.uniform(key).mount(() => {
                        const { gl } = self
                        if (!gl) return
                        const location = self.location(key) // @ts-ignore
                        const { type, isM } = getType(value)
                        self.gl.useProgram(self.pg)
                        if (isM) self.gl[type](location, false, value)
                        else self.gl[type](location, value)
                })
        }
        self.setAttribute = (key, value, count, iboValue) => {
                self.frame.mount(() => void self.attribute(key).flush(value))
                if (self.attribute.has(key)) return
                self.attribute(key).mount(() => {
                        const { gl } = self
                        if (!gl) return
                        const location = self.location(key, true)
                        const vbo = createVbo(gl, value)
                        const ibo = createIbo(gl, iboValue)
                        const stride = getStride(value, count)
                        gl.useProgram(self.pg)
                        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
                        gl.enableVertexAttribArray(location)
                        gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0)
                        if (ibo) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
                })
        }
        return self
}