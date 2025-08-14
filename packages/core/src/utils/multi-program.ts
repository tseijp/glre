import { nested as cached } from 'reev'
import { createProgram, createAttrib, createUniform, createTexture } from './program'
import { is } from './helpers'
import type { GL } from '../types'

export const createMultiProgramManager = (c: WebGL2RenderingContext, gl: GL) => {
        const programs = cached((id: string) => ({
                id,
                program: null as WebGLProgram | null,
                vertexShader: '',
                fragmentShader: '',
                uniforms: new Map<string, WebGLUniformLocation>(),
                attributes: new Map<string, number>(),
                textures: new Map<string, { location: WebGLUniformLocation; unit: number }>(),
                needsUpdate: true,
                activeUnit: 0
        }))

        const createProgramConfig = (id: string, vs: string, fs: string) => {
                const config = programs(id)
                config.vertexShader = vs
                config.fragmentShader = fs
                config.needsUpdate = true
                return config
        }

        const updateProgram = (id: string) => {
                const config = programs(id)
                if (!config.needsUpdate || !config.vertexShader || !config.fragmentShader) return

                const program = createProgram(c, config.fragmentShader, config.vertexShader, gl)
                if (!program) return

                config.program = program
                config.uniforms.clear()
                config.attributes.clear()
                config.textures.clear()
                config.activeUnit = 0
                config.needsUpdate = false
        }

        const addUniform = (id: string, key: string, value: number | number[]) => {
                const config = programs(id)
                if (!config.program) return

                const location = c.getUniformLocation(config.program, key)
                if (location) {
                        config.uniforms.set(key, location)
                        c.useProgram(config.program)
                        createUniform(c, location, value)
                }
        }

        const addAttribute = (id: string, key: string, value: number[]) => {
                const config = programs(id)
                if (!config.program) return

                const location = c.getAttribLocation(config.program, key)
                if (location >= 0) {
                        config.attributes.set(key, location)
                        const stride = Math.min(Math.max(Math.floor(value.length / (value.length / 4)), 1), 4)
                        createAttrib(c, location, stride, value)
                }
        }

        const addTexture = (id: string, key: string, src: string) => {
                const config = programs(id)
                if (!config.program) return

                const location = c.getUniformLocation(config.program, key)
                if (location) {
                        const unit = config.activeUnit++
                        config.textures.set(key, { location, unit })
                        
                        const img = new Image()
                        img.crossOrigin = 'anonymous'
                        img.onload = () => {
                                c.useProgram(config.program)
                                createTexture(c, img, location, unit)
                        }
                        img.src = src
                }
        }

        const renderProgram = (id: string, instanceCount: number, vertexCount: number) => {
                const config = programs(id)
                updateProgram(id)
                
                if (!config.program) return

                c.useProgram(config.program)
                
                if (instanceCount > 1) {
                        c.drawArraysInstanced(c.TRIANGLES, 0, vertexCount, instanceCount)
                } else {
                        c.drawArrays(c.TRIANGLES, 0, vertexCount)
                }
        }

        const clean = () => {
                for (const config of programs.map.values()) {
                        if (config.program) {
                                c.deleteProgram(config.program)
                        }
                }
        }

        return {
                createProgramConfig,
                addUniform,
                addAttribute,
                addTexture,
                renderProgram,
                updateProgram,
                clean,
                programs
        }
}