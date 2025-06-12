import { nested } from 'reev'
import { glsl } from './code/glsl'
import { is } from './utils/helpers'
import type { X } from './node'
import type { GL } from './types'
import { activeTexture, createAttrib, createIbo, createProgram, createTexture, createVbo } from './utils/program'

export const webgl = async (gl: GL) => {
        let vs = gl.vs || gl.vert || gl.vertex
        let fs = gl.fs || gl.frag || gl.fragment
        if (is.obj(fs)) fs = glsl(fs as X)
        if (is.obj(vs)) vs = glsl(vs as X)
        const c = gl.el.getContext('webgl2')!
        const pg = createProgram(c, vs, fs)

        let _activeUnit = 0
        const activeUnits = nested(() => _activeUnit++)

        const locations = nested((key, bool = false) => {
                if (bool) return c.getAttribLocation(pg, key)
                return c.getUniformLocation(pg, key) as WebGLUniformLocation
        })

        const strides = nested((_, count: number, value: number[], iboValue?: number[]) => {
                if (iboValue) count = Math.max(...iboValue) + 1
                const stride = value.length / count
                if (stride !== Math.floor(stride)) console.warn(`Vertex Stride Error: count ${count} is mismatch`)
                return Math.floor(stride)
        })

        const uniformTypes = nested((_, value: number | number[], isMatrix = false) => {
                let length = typeof value === 'number' ? 0 : value?.length
                if (!length) return `uniform1f`
                if (!isMatrix) return `uniform${length}fv`
                length = Math.sqrt(length) << 0
                return `uniformMatrix${length}fv`
        })

        gl('clean', () => c.deleteProgram(pg))

        gl('render', () => {
                c.useProgram(pg)
                gl.queue.flush()
                c.clear(c.COLOR_BUFFER_BIT)
                c.viewport(0, 0, ...gl.size)
                c.drawArrays(c.TRIANGLES, 0, gl.count)
        })

        gl('_attribute', (key = '', value: number[], iboValue: number[]) => {
                const loc = locations(key, true)
                const vbo = createVbo(c, value)
                const ibo = createIbo(c, iboValue)
                const str = strides(key, gl.count, value, iboValue)
                createAttrib(c, str, loc, vbo, ibo)
        })

        gl('_uniform', (key: string, value = 0, isMatrix = false) => {
                const type = uniformTypes(key, value, isMatrix)
                const loc = locations(key)
                if (isMatrix) (c as any)[type]?.(loc, false, value)
                else (c as any)[type]?.(loc, value)
        })

        const _loadFn = (image: HTMLImageElement) => {
                const loc = locations(image.alt)
                const unit = activeUnits(image.alt)
                const tex = createTexture(c, image)
                activeTexture(c, loc, unit, tex)
        }

        gl('_texture', (alt: string, src: string) => {
                const image = new Image()
                image.addEventListener('load', _loadFn.bind(null, image), false)
                Object.assign(image, { src, alt, crossOrigin: 'anonymous' })
        })

        gl.webgl = { context: c, program: pg }

        return gl
}
