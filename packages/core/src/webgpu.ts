import { nested as cached } from 'reev'
import { is } from './utils/helpers'
import {
        createAttribBuffer,
        createBindings,
        createDepthTexture,
        createDescriptor,
        createDevice,
        createPipeline,
        createTextureSampler,
        createUniformBuffer,
} from './utils/pipeline'
import type { GL, WebGPUState } from './types'
import { fragment, vertex } from './node'

export const webgpu = async (gl: Partial<GL>) => {
        const c = gl.el!.getContext('webgpu') as GPUCanvasContext
        const { device, format } = await createDevice(c)
        const bindings = createBindings()
        let frag: string
        let vert: string
        let flush = (_pass: GPURenderPassEncoder) => {}
        let imageLoading = 0
        let needsUpdate = true
        let depthTexture: GPUTexture

        const uniforms = cached((_key, value: number[]) => {
                needsUpdate = true
                const { array, buffer } = createUniformBuffer(device, value)
                const { binding, group } = bindings.uniform()
                return { binding, group, array, buffer }
        })

        const textures = cached((_key, width = 0, height = 0) => {
                needsUpdate = true
                const { texture, sampler } = createTextureSampler(device, width, height)
                const { binding, group } = bindings.texture()
                return { binding, group, texture, sampler, view: texture.createView() }
        })

        const attribs = cached((_key, value: number[]) => {
                needsUpdate = true
                const stride = value.length / gl.count!
                const { location } = bindings.attrib()
                const { array, buffer } = createAttribBuffer(device, value)
                return { array, buffer, location, stride }
        })

        const update = () => {
                const { pipeline, bindGroups, vertexBuffers } = createPipeline(device, format, vert, frag, state)
                flush = (pass) => {
                        pass.setPipeline(pipeline)
                        bindGroups.forEach((v, i) => pass.setBindGroup(i, v))
                        vertexBuffers.forEach((v, i) => pass.setVertexBuffer(i, v))
                        pass.draw(gl.count!, 1, 0, 0)
                        pass.end()
                }
        }

        const render = () => {
                if (!frag || !vert) {
                        const config = { isWebGL: false, gl }
                        frag = fragment(gl.fs, config)
                        vert = vertex(gl.vs, config)
                }
                if (imageLoading) return // MEMO: loading after build node
                if (needsUpdate) update()
                needsUpdate = false
                const encoder = device.createCommandEncoder()
                flush(encoder.beginRenderPass(createDescriptor(c, depthTexture)))
                device.queue.submit([encoder.finish()])
        }

        const resize = () => {
                const canvas = gl.el as HTMLCanvasElement
                depthTexture?.destroy()
                depthTexture = createDepthTexture(device, canvas.width, canvas.height)
        }

        const clean = () => {
                depthTexture?.destroy()
        }

        const _attribute = (key = '', value: number[]) => {
                const { array, buffer } = attribs(key, value)
                array.set(value)
                device.queue.writeBuffer(buffer, 0, array)
        }

        const _uniform = (key: string, value: number | number[]) => {
                if (is.num(value)) value = [value]
                const { array, buffer } = uniforms(key, value)
                array.set(value)
                device.queue.writeBuffer(buffer, 0, array)
        }

        const _texture = (key: string, src: string) => {
                imageLoading++
                const source = Object.assign(new Image(), { src, crossOrigin: 'anonymous' })
                source.decode().then(() => {
                        const { width, height } = source
                        const { texture } = textures(key, width, height)
                        device.queue.copyExternalImageToTexture({ source }, { texture }, { width, height })
                        imageLoading--
                })
        }

        resize()

        const state = { device, uniforms, textures, attribs } as WebGPUState

        return { webgpu: state, render, resize, clean, _attribute, _uniform, _texture }
}
