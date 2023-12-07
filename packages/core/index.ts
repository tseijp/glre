import { event, durable, nested } from 'reev'
import { queue, frame } from 'refr'
import {
        uniformType,
        vertexStride,
        createProgram,
        createTfProgram,
        createShader,
        createAttribute,
        createTexture,
        createVbo,
        createIbo,
        activeTexture,
} from './utils'
import type { GL } from './types'

const a_position = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]

const _defaultVertex = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`

const _defaultFragment = `
  precision mediump float;
  uniform vec2 iResolution;
  void main() {
    gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
  }
`

let iTime = performance.now(),
        iPrevTime = 0,
        iDeltaTime = 0

export const createGL = (props?: Partial<GL>) => {
        const init = () => {
                self(props)
                const gl = self.gl
                const _v = self.vs || self.vert || self.vertex
                const _f = self.fs || self.frag || self.fragment
                const vs = createShader(gl, _v, gl.VERTEX_SHADER)
                const fs = createShader(gl, _f, gl.FRAGMENT_SHADER)
                if (self.count === 6) self.attribute({ a_position })
                frame(() => void self.render() || 1)
                self.pg = self.varying
                        ? createTfProgram(gl, vs, fs, self.varying)
                        : createProgram(gl, vs, fs)
                self.lastActiveUnit = 0
                self.activeUnit = nested(() => self.lastActiveUnit++)
                self.location = nested((key, isAttribute = false) => {
                        return isAttribute
                                ? gl?.getAttribLocation(self.pg, key)
                                : gl?.getUniformLocation(self.pg, key)
                })
        }

        const render = () => {
                self.gl.useProgram(self.pg)
                self.frame.flush()
                iPrevTime = iTime
                iTime = performance.now() / 1000
                iDeltaTime = iTime - iPrevTime
                self.uniform({ iTime, iPrevTime, iDeltaTime })
        }

        const resize = (
                _e: any,
                width = self.width || window.innerWidth,
                height = self.height || window.innerHeight
        ) => {
                self.size[0] = self.el.width = width
                self.size[1] = self.el.height = height
                self.uniform('iResolution', self.size)
        }

        const mousemove = (_e: any, x = _e.clientX, y = _e.clientY) => {
                const [w, h] = self.size
                const { top, left } = self.el.getBoundingClientRect()
                self.mouse[0] = (x - top - w / 2) / (w / 2)
                self.mouse[1] = -(y - left - h / 2) / (h / 2)
                self.uniform('iMouse', self.mouse)
        }

        const load = (_: any, image: any) => {
                self.frame(() => {
                        const loc = self.location(image.alt)
                        const unit = self.activeUnit(image.alt)
                        const tex = createTexture(self.gl, image)
                        self.frame(() => {
                                activeTexture(self.gl, loc, unit, tex)
                                return true
                        })
                })
        }

        const clear = (key = 'COLOR_BUFFER_BIT') => {
                self.gl.clear(self.gl[key])
        }

        const viewport = (size: number[] = self.size) => {
                self.gl.viewport(0, 0, ...size)
        }

        const drawArrays = (mode = 'TRIANGLES') => {
                self.gl.drawArrays(self.gl[mode], 0, self.count)
        }

        const drawElements = (mode = 'TRIANGLES', type = 'UNSIGNED_SHORT') => {
                mode = self.gl[mode]
                type = self.gl[type]
                self.gl.drawElements(mode, self.count, type, 0)
        }

        const self = event<Partial<GL>>({
                vertex: _defaultVertex,
                fragment: _defaultFragment,
                size: [0, 0],
                mouse: [0, 0],
                count: 6,
                counter: 0,
                init,
                render,
                resize,
                mousemove,
                load,
                clear,
                viewport,
                drawArrays,
                drawElements,
        }) as GL

        const _texture = (
                alt: string,
                src: string,
                crossOrigin = 'anonymous'
        ) => {
                if (typeof window === 'undefined') return
                const image = new Image()
                const callback = (_: any) => self.load(_, image)
                image.addEventListener('load', callback, false)
                Object.assign(image, { src, alt, crossOrigin })
        }

        const _uniform = (key: string, value = 0, isMatrix = false) => {
                const type = uniformType(value, isMatrix)
                self.frame(() => {
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
                self.frame(() => {
                        const loc = self.location(key, true)
                        const vbo = createVbo(self.gl, value)
                        const ibo = createIbo(self.gl, iboValue)
                        const n = self.count
                        const stride = vertexStride(n, value, iboValue)
                        createAttribute(self.gl, stride, loc, vbo, ibo)
                })
        }

        self.frame = queue()
        self.texture = durable(_texture)
        self.uniform = durable(_uniform)
        self.attribute = durable(_attribute)

        return self
}

export const gl = createGL()

export const createTF = (props?: Partial<GL>, self = gl) => {
        const mount = () => {
                tf(props)
                tf.el = self.el
                tf.gl = self.gl
                tf.frame = self.frame
                tf.init()
                self({ resize: tf.resize, mousemove: tf.mousemove })
        }

        const clean = () => {
                tf(props)
                self({ resize: tf.resize, mousemove: tf.mousemove })
        }

        const tf = createGL()

        tf({ mount, clean })
        return tf
}

export default gl
