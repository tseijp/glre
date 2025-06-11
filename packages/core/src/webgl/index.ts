import { durable, nested } from 'reev'
import { createAttribute, createIbo, createVbo, vertexStride } from './buffer'
import { createProgram, getUniformType } from './program'
import { createFragmentShader, createVertexShader } from './shader'
import { activeTexture, createTexture } from './texture'
import { glsl } from '../code/glsl'
import { is } from '../utils'
import type { X } from '../node'
import type { GL } from '../types'
export * from './buffer'
export * from './program'
export * from './shader'
export * from './texture'

const a_position = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]

export const webgl = (self: GL) => {
        // public method
        self('mount', () => {
                const c = self.gl
                let vs = self.vs || self.vert || self.vertex
                let fs = self.fs || self.frag || self.fragment
                if (is.obj(fs)) fs = glsl(fs as X)
                if (is.obj(vs)) vs = glsl(vs as X)
                if (self.count === 6) self.attribute({ a_position })
                self.pg = createProgram(
                        c,
                        createVertexShader(c, vs),
                        createFragmentShader(c, fs)
                )
                self.location = nested((key, isAttribute = false) => {
                        return isAttribute
                                ? c.getAttribLocation(self.pg, key)
                                : c.getUniformLocation(self.pg, key)
                })
        })

        self('render', () => {
                const c = self.gl
                c.useProgram(self.pg)
                self.queue.flush()
                c.clear(c.COLOR_BUFFER_BIT)
                c.viewport(0, 0, ...self.size)
                c.drawArrays(c.TRIANGLES, 0, self.count)
        })

        // private method
        const _attribute = (
                key: string,
                value: number[],
                iboValue: number[]
        ) => {
                self.queue(() => {
                        const c = self.gl
                        const n = self.count
                        const loc = self.location(key, true)
                        const vbo = createVbo(c, value)
                        const ibo = createIbo(c, iboValue)
                        const stride = vertexStride(n, value, iboValue)
                        createAttribute(c, stride, loc, vbo, ibo)
                })
        }

        const _uniform = (key: string, value = 0, isMatrix = false) => {
                const type = getUniformType(value, isMatrix)
                self.queue(() => {
                        const c = self.gl
                        const loc = self.location(key)
                        if (isMatrix) c[type](loc, false, value)
                        else c[type](loc, value)
                })
        }

        const _loadFn = (image: HTMLImageElement) => {
                self.queue(() => {
                        const loc = self.location(image.alt)
                        const unit = self.activeUnit(image.alt)
                        const tex = createTexture(self.gl, image)
                        self.queue(() => {
                                activeTexture(self.gl, loc, unit, tex)
                                return true
                        })
                })
        }

        const _texture = (alt: string, src: string) => {
                const image = new Image()
                image.addEventListener('load', _loadFn.bind(null, image), false)
                Object.assign(image, { src, alt, crossOrigin: 'anonymous' })
        }

        let _activeUnit = 0
        self.activeUnit = nested(() => _activeUnit++)
        self.attribute = durable(_attribute)
        self.uniform = durable(_uniform)
        self.texture = durable(_texture)
        return self
}
