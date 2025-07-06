import { nested as cached } from 'reev'
import { is } from './utils/helpers'
import {
        createAttribBuffer,
        createBindGroup,
        createBindings,
        createDepthTexture,
        createDescriptor,
        createDevice,
        createPipeline,
        createTextureSampler,
        createUniformBuffer,
        createVertexBuffers,
} from './utils/pipeline'
import type { GL, WebGPUState } from './types'

export const webgpu = async (gl: Partial<GL>) => {
        const c = gl.el!.getContext('webgpu') as GPUCanvasContext
        const { device, format } = await createDevice(c)
        const bindings = createBindings()
        let imageLoading = 0
        let needsUpdate = true
        let depthTexture: GPUTexture
        let _render = (_pass: GPURenderPassEncoder) => {}

        const uniforms = cached((_key, value: number[]) => {
                needsUpdate = true
                const { group, binding } = bindings.uniform()
                const { array, buffer } = createUniformBuffer(device, value)
                return { array, buffer, binding, group }
        })

        const textures = cached((_key, { width, height }: HTMLImageElement) => {
                needsUpdate = true
                const { group, binding } = bindings.texture()
                const { texture, sampler } = createTextureSampler(device, width, height)
                return { texture, sampler, binding, group }
        })

        const attribs = cached((_key, value: number[]) => {
                needsUpdate = true
                const stride = value.length / gl.count!
                const { location } = bindings.attrib()
                const { array, buffer } = createAttribBuffer(device, value)
                return { array, buffer, location, stride }
        })

        const update = () => {
                const { vertexBuffers, bufferLayouts } = createVertexBuffers(attribs.map)
                const { bindGroups, bindGroupLayouts } = createBindGroup(device, uniforms.map, textures.map)
                const pipeline = createPipeline(device, format, bufferLayouts, bindGroupLayouts, webgpu, gl.vs, gl.fs)
                _render = (pass) => {
                        pass.setPipeline(pipeline)
                        bindGroups.forEach((v, i) => pass.setBindGroup(i, v))
                        vertexBuffers.forEach((v, i) => pass.setVertexBuffer(i, v))
                        pass.draw(gl.count!, 1, 0, 0)
                        pass.end()
                }
        }

        const render = () => {
                if (imageLoading) return
                if (needsUpdate) update()
                needsUpdate = false
                const encoder = device.createCommandEncoder()
                _render(encoder.beginRenderPass(createDescriptor(c, depthTexture)))
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
                        const texture = textures(key, source)
                        device.queue.copyExternalImageToTexture(
                                { source },
                                { texture: texture.texture },
                                { width: source.width, height: source.height }
                        )
                        imageLoading--
                })
        }

        resize()

        const webgpu = { device, uniforms, textures, attribs } as WebGPUState

        return { webgpu, render, resize, clean, _attribute, _uniform, _texture }
}
