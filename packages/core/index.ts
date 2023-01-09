import { frame } from 'refr'
import { glEvent } from './events'
import { durable, nested } from 'reev'
import { createVbo, createIbo, interleave, isTemplateLiteral } from './utils'
import type { GL, GLInitArg } from './types'

const a_position = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

const _defaultVertexShader = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`

const _defaultFragmentShader = `
  precision highp float;
  uniform vec2 resolution;
  void main() {
    gl_FragColor = vec4(fract(gl_FragCoord.xy / resolution), 0, 1);
  }
`

export const gl = (initArg?: GLInitArg, ...initArgs: any[]) => {
        const self = ((arg: any, ...args: any[]) => {
                if (isTemplateLiteral(arg)) arg = interleave(arg, args)
                if (typeof arg === 'string') self.frag = arg
                if (typeof arg === 'function') self.frame.mount(arg)
                return self
        }) as GL

        // default state
        self.id = 'myCanvas' // @TODO feat: create hashid
        self.frag = _defaultFragmentShader;
        self.vert = _defaultVertexShader;
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
        self.setDpr = (...args) => void ev('resize', {}, ...args) || self
        self.setSize = (...args) => void ev('resize', {}, ...args) || self
        self.setFrame = (frame) => void fr.mount(frame) || self
        self.setMount = (mount) => void ev.mount({ mount }) || self
        self.setClean = (clean) => void ev.mount({ clean }) || self
        self.setConfig = durable((key, value) => void (self[key] = value), self)

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
        self.mount = () => ev("mount")
        self.clean = () => ev("clean")
        self.clear = (key) => self.gl.clear(self.gl[key || "COLOR_BUFFER_BIT"])
        self.viewport = (size) => self.gl.viewport(0, 0, ...(size || self.size))
        self.drawArrays = (mode = 'TRIANGLES') =>
                self.gl.drawArrays(self.gl[mode], 0, self.count)
        self.drawElements = (mode = 'TRIANGLES', type = 'UNSIGNED_SHORT') =>
                self.gl.drawElements(self.gl[mode], self.count, self.gl[type], 0)

        // init config
        if (isTemplateLiteral(initArg)) initArg = interleave(initArg, initArgs)
        if (typeof initArg === "string") self.frag = initArg
        if (typeof initArg === "object") self.setConfig(initArg)
        if (self.count === 6) self.setAttribute({ a_position })

        return self;
}

gl.default = null as unknown as GL

export default gl