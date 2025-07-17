import { nested as cached } from 'reev'
import { is } from './utils/helpers'
import {
        createAttribBuffer,
        createBindings,
        createBindGroup,
        createDepthTexture,
        createDescriptor,
        createDevice,
        createPipeline,
        createTextureSampler,
        createUniformBuffer,
        createVertexBuffers,
} from './utils/pipeline'
import type { GL, WebGPUState } from './types'
import { fragment, vertex } from './node'

export const webgpu = async (gl: GL) => {
        const context = gl.el!.getContext('webgpu') as GPUCanvasContext
        const { device, format } = await createDevice(context)
        device.onuncapturederror = (e) => gl.error(e.error.message)
        const bindings = createBindings()
        let frag: string
        let vert: string
        let flush = (_pass: GPURenderPassEncoder) => {}
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
                const stride = value.length / gl.count
                const { location } = bindings.attrib()
                const { array, buffer } = createAttribBuffer(device, value)
                return { array, buffer, location, stride }
        })

        const update = () => {
                const { vertexBuffers, bufferLayouts } = createVertexBuffers(attribs.map.values())
                const { bindGroups, bindGroupLayouts } = createBindGroup(
                        device,
                        uniforms.map.values(),
                        textures.map.values()
                )
                const pipeline = createPipeline(device, format, bufferLayouts, bindGroupLayouts, vert, frag)
                flush = (pass) => {
                        pass.setPipeline(pipeline)
                        bindGroups.forEach((v, i) => pass.setBindGroup(i, v))
                        vertexBuffers.forEach((v, i) => pass.setVertexBuffer(i, v))
                        pass.draw(gl.count, 1, 0, 0)
                        pass.end()
                }
        }

        const render = () => {
                if (!frag || !vert) {
                        const config = { isWebGL: false, gl }
                        frag = fragment(gl.fs, config)
                        vert = vertex(gl.vs, config)
                }
                if (gl.loading) return // MEMO: loading after build node
                if (needsUpdate) update()
                needsUpdate = false
                const encoder = device.createCommandEncoder()
                flush(encoder.beginRenderPass(createDescriptor(context, depthTexture)))
                device.queue.submit([encoder.finish()])
        }

        const resize = () => {
                const canvas = gl.el as HTMLCanvasElement
                depthTexture?.destroy()
                depthTexture = createDepthTexture(device, canvas.width, canvas.height)
        }

        const clean = () => {
                device.destroy()
                depthTexture?.destroy()
                for (const { texture } of textures.map.values()) texture.destroy()
                for (const { buffer } of uniforms.map.values()) buffer.destroy()
                for (const { buffer } of attribs.map.values()) buffer.destroy()
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
                gl.loading++
                const source = Object.assign(new Image(), { src, crossOrigin: 'anonymous' })
                source.decode().then(() => {
                        const { width, height } = source
                        const { texture } = textures(key, width, height)
                        device.queue.copyExternalImageToTexture({ source }, { texture }, { width, height })
                        gl.loading--
                })
        }

        resize()

        return {
                webgpu: { device, uniforms, textures, attribs } as WebGPUState,
                render,
                resize,
                clean,
                _attribute,
                _uniform,
                _texture,
        }
}
