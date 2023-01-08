import { frame } from 'refr'
import { glEvent } from './events'
import { durable, nested } from 'reev'
import { createVbo, createIbo } from './utils'
import type { GL, GLConfig } from './types'

export const defaultConfig: GLConfig = {
        id: 'myCanvas',
        frag: '', // @TODO feat: add default fragment shader
        vert: '', // @TODO feat: add default vertex shader
        size: [0, 0],
        mouse: [0, 0],
        count: 1000,
}

export const gl = (config?: string | Partial<GLConfig>) => {
        const self = ((arg = '') => {
          if (typeof arg === 'function') return self.frame.mount(arg)
        }) as GL

        // core state
        const ev = (self.event = glEvent(self))
        const fr = (self.frame = frame())
        self.lastActiveUnit = 0
        self.activeUnit = nested(() => self.lastActiveUnit++)
        self.stride = nested((_key, value, iboValue) => {
                const count = iboValue?.length || self.count
                return (value.length / count) << 0
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

        // config
        self.setConfig = durable((key, value) => {
                self[key] = value || defaultConfig[key]
        }, self)

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

        return self
}

export default gl


