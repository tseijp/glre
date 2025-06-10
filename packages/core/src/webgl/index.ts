import { durable, nested } from 'reev'
import { createAttribute, createIbo, createVbo, vertexStride } from './buffer'
import { createProgram, createTfProgram } from './program'
import { createFragmentShader, createVertexShader } from './shader'
import { base } from '../base'
import { glsl } from '../code/glsl'
import { updateUniforms } from '../node'
import type { NodeProxy } from '../node'
import type { GL } from '../../types'

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

                let vertexSource = self.vs || self.vert || self.vertex
                let fragmentSource = self.fs || self.frag || self.fragment

                // ノードからシェーダー生成
                if (self.fragmentNode)
                        fragmentSource = glsl(self.fragmentNode as NodeProxy)

                const vs = createVertexShader(c, vertexSource)
                const fs = createFragmentShader(c, fragmentSource)

                if (self.count === 6) self.attribute({ a_position })
                self.frame(() => {
                        self.render()
                        return true
                })
                self.pg = self.varying
                        ? createTfProgram(c, vs, fs, self.varying)
                        : createProgram(c, vs, fs)
                self.lastActiveUnit = 0
                self.activeUnit = nested(() => self.lastActiveUnit++)
                self.location = nested((key, isAttribute = false) => {
                        return isAttribute
                                ? c?.getAttribLocation(self.pg, key)
                                : c?.getUniformLocation(self.pg, key)
                })
        }

        const render = () => {
                self.gl.useProgram(self.pg)
                self.queue.flush()
                iPrevTime = iTime
                iTime = performance.now() / 1000
                iDeltaTime = iTime - iPrevTime
                self.uniform({ iTime, iPrevTime, iDeltaTime })
                if (self.fragmentNode) updateUniforms({ time: iTime })
        }

        const _uniform = (key: string, value = 0, isMatrix = false) => {
                const type = uniformType(value, isMatrix)
                self.queue(() => {
                        const loc = self.location(key)
                        if (isMatrix) self.gl[type](loc, false, value)
                        else self.gl[type](loc, value)
                })
        }

        const _attribute = (
                key: string,
                value: number[],
                iboValue?: number[]
        ) => {
                self.queue(() => {
                        const loc = self.location(key, true)
                        const vbo = createVbo(self.gl, value)
                        const ibo = createIbo(self.gl, iboValue)
                        const n = self.count
                        const stride = vertexStride(n, value, iboValue)
                        createAttribute(self.gl, stride, loc, vbo, ibo)
                })
        }

        const self = base(props)

        self.uniform = durable(_uniform)
        self.attribute = durable(_attribute)
        self.renderer = 'webgl'
        self.init = init
        self.render = render

        return self
}
