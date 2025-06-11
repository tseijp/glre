import { durable, nested } from 'reev'
import { createAttribute, createIbo, createVbo, vertexStride } from './buffer'
import { createProgram } from './program'
import { createFragmentShader, createVertexShader } from './shader'
import { base } from '../base'
import { glsl } from '../code/glsl'
import type { X } from '../node'
import type { GL } from '../types'
import { is } from '../utils'
export * from './buffer'
export * from './program'
export * from './shader'
export * from './texture'

let iTime = performance.now(),
        iPrevTime = 0,
        iDeltaTime = 0

const a_position = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]

export const webgl = (props?: Partial<GL>) => {
        const init = () => {
                self(props)
                const c = self.gl
                let vs = self.vs || self.vert || self.vertex
                let fs = self.fs || self.frag || self.fragment
                if (is.obj(fs)) fs = glsl(fs as X)
                if (self.count === 6) self.attribute({ a_position })
                self.lastActiveUnit = 0
                self.activeUnit = nested(() => self.lastActiveUnit++)
                self.location = nested((key, isAttribute = false) => {
                        return isAttribute
                                ? c?.getAttribLocation(self.pg, key)
                                : c?.getUniformLocation(self.pg, key)
                })
                self.pg = createProgram(
                        c,
                        createVertexShader(c, vs),
                        createFragmentShader(c, fs)
                )
        }

        const loop = () => {
                const c = self.gl
                c.useProgram(self.pg)
                self.queue.flush()
                iPrevTime = iTime
                iTime = performance.now() / 1000
                iDeltaTime = iTime - iPrevTime
                self.uniform({ iTime, iPrevTime, iDeltaTime })
                // if (self.fragmentNode) updateUniforms({ time: iTime }) // @TODO FIX
                c.clear(c.COLOR_BUFFER_BIT)
                c.viewport(0, 0, ...self.size)
                c.drawArrays(c.TRIANGLES, 0, self.count)
        }

        const _uniform = (key: string, value = 0, isMatrix = false) => {
                const type = uniformType(value, isMatrix)
                self.queue(() => {
                        const c = self.gl
                        const loc = self.location(key)
                        if (isMatrix) c[type](loc, false, value)
                        else c[type](loc, value)
                })
        }

        const _attribute = (
                key: string,
                value: number[],
                iboValue: number[]
        ) => {
                self.queue(() => {
                        const c = self.gl
                        const loc = self.location(key, true)
                        const vbo = createVbo(c, value)
                        const ibo = createIbo(c, iboValue)
                        const n = self.count
                        const stride = vertexStride(n, value, iboValue)
                        createAttribute(c, stride, loc, vbo, ibo)
                })
        }

        const self = base(props)
        self.uniform = durable(_uniform)
        self.attribute = durable(_attribute)
        self.webgl = true
        self.init = init
        self.loop = loop
        return self
}
