import { frame } from 'refr'
import { glEvent } from './events'
import { durable, nested } from 'reev'
import { createAttribute, interleave, isTemplateLiteral, switchUniformType } from './utils'
import type { GL } from './types'

const a_position = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

const _defaultVertexShader = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`

const _defaultFragmentShader = `
  uniform vec2 resolution;
  void main() {
    gl_FragColor = vec4(fract(gl_FragCoord.xy / resolution), 0, 1);
  }
`

export const gl = (initArg?: Partial<GL>, ...initArgs: any[]) => {
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
        // self.float = "mediump" // @TODO check bugs
        self.size = [0, 0]
        self.mouse = [0, 0]
        self.count = 6
        self.uniformHeader = []
        self.attributeHeader = []

        // core state
        const ev = (self.event = glEvent(self))
        const fr = (self.frame = frame())
        self.lastActiveUnit = 0
        self.activeUnit = nested(() => self.lastActiveUnit++)
        self.vertexStride = nested((key, value, iboValue) => {
                const count = iboValue ? Math.max(...iboValue) + 1 : self.count;
                const stride = (value.length / count) << 0
                self.attributeHeader.push([key, `vertex vec${stride} ${key};`])
                return stride
        })

        self.uniformType = nested((key, value, isMatrix) => {
                const [type, code] = switchUniformType(value, isMatrix)
                self.uniformHeader.push([key, `uniform ${code} ${key};`])
                return type
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
                self.setFrame(() => {
                        if (isMatrix)
                                self.gl[type](self.location(key), false, value)
                        else self.gl[type](self.location(key), value)
                })
        }, self)

        // attribute
        self.setAttribute = durable((key, ...args) => {
                const stride = self.vertexStride(key, ...args)
                self.setFrame(() => {
                        createAttribute(self.gl, stride, self.location(key, true), ...args)
                })
        }, self)

        // texture
        self.setTexture = durable((key, src) => {
                const image = new Image()
                image.addEventListener("load", (e) => ev("load", e, image), false)
                Object.assign(image, { src, alt: key, crossOrigin: 'anonymous' })
        }, self)

        // shorthands
        self.mount = ev.on("mount")
        self.clean = ev.on("clean")
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