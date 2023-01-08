import { frame } from 'refr'
import { glEvent } from './events'
import { durable, nested } from 'reev'
import { createVbo, createIbo } from './utils'
import type { GL, GLConfig } from './types'

export const gl = (config?: string | Partial<GLConfig>) => {
        const self = ((arg = '') => {
                if (typeof arg === 'function') return self.frame.mount(arg)
        }) as GL

        // default state
        self.id = 'myCanvas'
        self.frag = ''; // @TODO feat: add default fragment shader
        self.vert = ''; // @TODO feat: add default vertex shader
        self.size = [0, 0]
        self.mouse = [0, 0]
        self.count = 6

        // core state
        const ev = (self.event = glEvent(self))
        const fr = (self.frame = frame())
        self.lastActiveUnit = 0
        self.activeUnit = nested(() => self.lastActiveUnit++)
        self.stride = nested((_key, value, iboValue) => {
                const count = iboValue ? Math.max(...iboValue) + 1 : self.count;
                return (value.length / count) << 0;
        })
        self.uniformType = nested((_key, value, isMatrix = false) => {
                if (typeof value === 'number') return `uniform1f`
                if (!isMatrix) return `uniform${value.length}fv`
                else return `uniformMatrix${Math.sqrt(value.length) << 0}fv`
        })
        self.location = nested((key, isAttribute = false) => {
                return isAttribute
                        ? self.gl?.getAttribLocation(self.pg, key)
                        : self.gl?.getUniformLocation(self.pg, key)
        })

        // setter
        self.setDpr = (...args) => void ev('resize', ...args) || self
        self.setSize = (...args) => void ev('resize', ...args) || self
        self.setFrame = (frame) => void fr.mount(frame) || self
        self.setMount = (mount) => void ev.mount({ mount }) || self
        self.setClean = (clean) => void ev.mount({ clean }) || self
        self.setConfig = durable((key, value) => void (self[key] = value), self)

        // init config
        self.setConfig(defaultConfig)
        if (typeof config === "string") config = { id: config }
        if (typeof config === "object") self.setConfig(config)

        // uniform
        self.setUniform = durable((key, value, isMatrix = false) => {
                const type = self.uniformType(key, value, isMatrix)
                if (isMatrix)
                        self.setFrame(() => self.gl[type](self.location(key), false, value))
                else self.setFrame(() => self.gl[type](self.location(key), value))
        }, self)

        // attribute
        self.setAttribute = durable((key, value, iboValue) => {
                self.setFrame(() => {
                        const { gl } = self
                        const stride = self.stride(key, value, iboValue)
                        const location = self.location(key, true)
                        gl.bindBuffer(gl.ARRAY_BUFFER, createVbo(gl, value))
                        gl.enableVertexAttribArray(location)
                        gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0)
                        if (iboValue)
                                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, createIbo(gl, iboValue))
                })
        }, self)

        // texture
        self.setTexture = durable((key, src) => {
                const image = new Image()
                image.addEventListener('load', ev.on('load'), false)
                Object.assign(image, { src, alt: key, crossOrigin: 'anonymous' })
        }, self)

        // shorthands
        self.clear = (key) => self.gl.clear(self.gl[key || "COLOR_BUFFER_BIT"])
        self.viewport = (size) => self.gl.viewport(0, 0, ...(size || self.size))
        self.drawArrays = (mode = 'POINTS') =>
                self.gl.drawArrays(self.gl[mode], 0, self.count)
        self.drawElements = (mode = 'TRIANGLES', type = 'UNSIGNED_SHORT') =>
                self.gl.drawElements(self.gl[mode], self.count, self.gl[type], 0)

        return self;
}

export default gl


