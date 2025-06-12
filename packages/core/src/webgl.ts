import { nested } from 'reev'
import { glsl } from './code/glsl'
import { is } from './utils/helpers'
import type { X } from './node'
import type { GL } from './types'
import {
        activeTexture,
        createAttribute,
        createIbo,
        createProgram,
        createTexture,
        createVbo,
        getUniformType,
        vertexStride,
} from './utils/webgl'

const a_position = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]

export const webgl = (gl: GL) => {
        gl('init', () => {
                const c = gl.gl
                let vs = gl.vs || gl.vert || gl.vertex
                let fs = gl.fs || gl.frag || gl.fragment
                if (is.obj(fs)) fs = glsl(fs as X)
                if (is.obj(vs)) vs = glsl(vs as X)
                if (gl.count === 6) gl.attribute({ a_position })
                gl.pg = createProgram(c, vs, fs)
                gl.location = nested((key, isAttribute = false) => {
                        return isAttribute ? c.getAttribLocation(gl.pg, key) : c.getUniformLocation(gl.pg, key)
                })
        })

        gl('clean', () => {
                const c = gl.gl
                c.deleteProgram(gl.pg)
        })

        gl('render', () => {
                const c = gl.gl
                c.useProgram(gl.pg)
                gl.queue.flush()
                c.clear(c.COLOR_BUFFER_BIT)
                c.viewport(0, 0, ...gl.size)
                c.drawArrays(c.TRIANGLES, 0, gl.count)
        })

        gl('_attribute', (key = '', value: number[], iboValue: number[]) => {
                const c = gl.gl
                const n = gl.count
                const loc = gl.location(key, true)
                const vbo = createVbo(c, value)
                const ibo = createIbo(c, iboValue)
                const stride = vertexStride(n, value, iboValue)
                createAttribute(c, stride, loc, vbo, ibo)
        })

        gl('_uniform', (key: string, value = 0, isMatrix = false) => {
                const type = getUniformType(value, isMatrix)
                const c = gl.gl
                const loc = gl.location(key)
                if (isMatrix) c[type](loc, false, value)
                else c[type](loc, value)
        })

        const _loadFn = (image: HTMLImageElement) => {
                const loc = gl.location(image.alt)
                const unit = gl.activeUnit(image.alt)
                const tex = createTexture(gl.gl, image)
                activeTexture(gl.gl, loc, unit, tex)
        }

        gl('_texture', (alt: string, src: string) => {
                const image = new Image()
                image.addEventListener('load', _loadFn.bind(null, image), false)
                Object.assign(image, { src, alt, crossOrigin: 'anonymous' })
        })

        let _activeUnit = 0
        gl.activeUnit = nested(() => _activeUnit++)
        return gl
}
