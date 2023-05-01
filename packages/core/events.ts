import { event } from 'reev'
import { createProgram, createShader, createTexture, concat } from './utils'
import type { GL, GLEvent } from './types'

export const glEvent = (self: GL) => {
        const e = event<GLEvent>()
        return e({
                // run if canvas is mounted
                mount() {
                        if (self.int)
                                self.frag = concat(
                                        self.frag,
                                        `precision ${self.int} int;`
                                )
                        if (self.float)
                                self.frag = concat(
                                        self.frag,
                                        `precision ${self.float} float;`
                                )
                        if (self.sampler2D)
                                self.frag = concat(
                                        self.frag,
                                        `precision ${self.sampler2D} sampler2D;`
                                )
                        if (self.samplerCube)
                                self.frag = concat(
                                        self.frag,
                                        `precision ${self.samplerCube} samplerCube;`
                                )
                        const el = (self.el = document.getElementById(self.id))
                        const gl = (self.gl = (el as any)?.getContext('webgl'))
                        const frag = createShader(
                                gl,
                                self.frag,
                                gl.FRAGMENT_SHADER
                        )
                        const vert = createShader(
                                gl,
                                self.vert,
                                gl.VERTEX_SHADER
                        )
                        self.pg = createProgram(gl, vert, frag)
                        window.addEventListener('resize', e.resize)
                        window.addEventListener('mousemove', e.mousemove)
                        e.resize()
                        let iTime = performance.now(),
                                iPrevTime = 0,
                                iDeltaTime = 0
                        self.setFrame(() => {
                                iPrevTime = iTime
                                iTime = performance.now() / 1000
                                iDeltaTime = iTime - iPrevTime
                                self.setUniform({
                                        iTime,
                                        iPrevTime,
                                        iDeltaTime,
                                })
                                return true
                        })
                        self.frame()
                },
                // run if canvas is cleaned
                clean() {
                        window.removeEventListener('resize', e.resize)
                        window.removeEventListener('mousemove', e.mousemove)
                        self.frame.cancel()
                },
                // user mousemove event
                mousemove({ clientX, clientY }) {
                        const [w, h] = self.size
                        self.mouse[0] = (clientX - w / 2) / (w / 2)
                        self.mouse[1] = -(clientY - h / 2) / (h / 2)
                        self.setUniform('iMouse', self.mouse)
                },
                // user mousemove event
                resize(
                        _resizeEvent,
                        width = window.innerWidth,
                        height = window.innerHeight
                ) {
                        self.size[0] = self.el.width = width
                        self.size[1] = self.el.height = height
                        self.setUniform('iResolution', self.size)
                },
                // load image event
                load(_loadEvent, image) {
                        self.setFrame(() => {
                                const activeUnit = self.activeUnit(image.alt)
                                const location = self.location(image.alt)
                                const texture = createTexture(self.gl, image)
                                self.setFrame(() => {
                                        self.gl.uniform1i(location, activeUnit)
                                        self.gl.activeTexture(
                                                self.gl['TEXTURE' + activeUnit]
                                        )
                                        self.gl.bindTexture(
                                                self.gl.TEXTURE_2D,
                                                texture
                                        )
                                        return true
                                })
                        })
                },
        } as any)
}
