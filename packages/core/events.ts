import { event } from 'reev'
import { createProgram, createShader, createTexture, concat } from './utils'
import type { GL } from './types'

export const glEvent = (self: GL) =>
    event({
            // run if canvas is mounted
            mount(e) {
                    // @TODO abbreviate to import uniform
                    // self.uniformHeader.map(([key, header]) => self.frag = concat(self.frag, header, key))
                    // self.uniformHeader.map(([key, header]) => self.frag = concat(self.vert, header, key))
                    // self.attributeHeader.map(([key, header]) => self.vert = concat(self.vert, header, key))
                    if (self.int) self.frag = concat(self.frag, `precision ${self.int} int;`)
                    if (self.float) self.frag = concat(self.frag, `precision ${self.float} float;`)
                    if (self.sampler2D) self.frag = concat(self.frag, `precision ${self.sampler2D} sampler2D;`)
                    if (self.samplerCube) self.frag = concat(self.frag, `precision ${self.samplerCube} samplerCube;`)
                    const el = (self.el = document.getElementById(self.id)) // @ts-ignore
                    const gl = (self.gl = el?.getContext('webgl'))
                    const frag = createShader(gl, self.frag, gl?.FRAGMENT_SHADER)
                    const vert = createShader(gl, self.vert, gl?.VERTEX_SHADER)
                    self.pg = createProgram(gl, vert, frag) // !!!
                    window.addEventListener('resize', e.on('resize'))
                    window.addEventListener('mousemove', e.on('mousemove'))
                    e('resize')
                    let iTime = performance.now(), iPrevTime = 0, iDeltaTime = 0;
                    self.setFrame(() => {
                            iPrevTime = iTime
                            iTime = performance.now() / 1000
                            iDeltaTime = iTime - iPrevTime
                            self.setUniform({ iTime, iPrevTime, iDeltaTime })
                            return true;
                    })
                    self.frame()
            },
            // run if canvas is cleaned
            clean(e) {
                    window.removeEventListener('resize', e.on('resize'))
                    window.removeEventListener('mousemove', e.on('mousemove'))
                    self.frame.cancel()
            },
            // user mousemove event
            mousemove(_e, { clientX, clientY }) {
                    const [w, h] = self.size
                    self.mouse[0] = (clientX - w / 2) / (w / 2)
                    self.mouse[1] = -(clientY - h / 2) / (h / 2)
                    self.setUniform('iMouse', self.mouse)
            },
            // user mousemove event
            resize(_e, _resizeEvent, width = 0, height = 0) {
                    self.size[0] = self.el.width = width || window.innerWidth
                    self.size[1] = self.el.height = height || window.innerHeight
                    self.setUniform('iResolution', self.size)
            },
            // load image event
            load(_e, _loadEvent, image) {
                    self.setFrame(() => {
                            const activeUnit = self.activeUnit(image.alt)
                            const location = self.location(image.alt)
                            const texture = createTexture(self.gl, image)
                            self.setFrame(() => {
                                    self.gl.uniform1i(location, activeUnit)
                                    self.gl.activeTexture(self.gl['TEXTURE' + activeUnit])
                                    self.gl.bindTexture(self.gl.TEXTURE_2D, texture)
                                    return true
                            })
                    })
            }
    } as any)
