import { nested as cached } from 'reev'
import { is } from './utils/helpers'
import {
        createAttribBuffer,
        createBindGroup,
        createBindingManager,
        createDevice,
        createPipeline,
        createDescriptor,
        createUniformBuffer,
        createTextureSampler,
        createVertexBuffers,
} from './utils/pipeline'
import type { GL, WebGPUState } from './types'

export const webgpu = async (gl: Partial<GL>) => {
        const c = gl.el!.getContext('webgpu') as GPUCanvasContext
        const { device, format } = await createDevice(c)
        const bindingManager = createBindingManager()

        const state = {
                device,
                context: c,
                resources: [],
                imageLoading: 0,
                needsUpdate: true,
        } as unknown as WebGPUState

        const uniforms = cached((_key, value: number[]) => {
                state.needsUpdate = true
                const { group, binding } = bindingManager.nextUniform()
                const { array, buffer } = createUniformBuffer(device, value)
                return { array, buffer, binding, group }
        })

        const textures = cached((_key, { width, height }: HTMLImageElement) => {
                state.needsUpdate = true
                const { group, binding } = bindingManager.nextTexture()
                const { texture, sampler } = createTextureSampler(device, width, height)
                return { binding, group, texture, sampler }
        })

        const attributes = cached((_key, value: number[]) => {
                state.needsUpdate = true
                const { location } = bindingManager.nextAttribute()
                const { array, buffer } = createAttribBuffer(device, value)
                const stride = value.length / gl.count!
                return { array, buffer, location, stride, offset: location * stride * 4 }
        })

        const update = () => {
                const { vertexBuffers, bufferLayouts } = createVertexBuffers(attributes.map, gl.count)
                const { bindGroups, bindGroupLayouts } = createBindGroup(device, uniforms.map, textures.map)
                state.pipeline = createPipeline(device, format, bufferLayouts, bindGroupLayouts, gl.vs, gl.fs, gl)
                state.bindGroups = bindGroups
                state.vertexBuffers = vertexBuffers
        }

        const render = () => {
                if (state.imageLoading) return
                if (state.needsUpdate) update()
                state.needsUpdate = false
                const encoder = device.createCommandEncoder()
                const pass = encoder.beginRenderPass(createDescriptor(c))
                pass.setPipeline(state.pipeline)
                state.bindGroups.forEach((v, i) => pass.setBindGroup(i, v))
                state.vertexBuffers.forEach((v, i) => v && pass.setVertexBuffer(i, v))
                pass.draw(gl.count!, 1, 0, 0)
                pass.end()
                device.queue.submit([encoder.finish()])
        }

        const clean = () => {}

        const _attribute = (key = '', value: number[]) => {
                const attribute = attributes(key, value)
                attribute.array.set(value)
                device.queue.writeBuffer(attribute.buffer, attribute.offset, attribute.array)
        }

        const _uniform = (key: string, value: number | number[]) => {
                if (is.num(value)) value = [value]
                const uniform = uniforms(key, value)
                uniform.array.set(value)
                device.queue.writeBuffer(uniform.buffer, 0, uniform.array)
        }

        const _texture = (key: string, src: string) => {
                state.imageLoading++
                const source = Object.assign(new Image(), { src, crossOrigin: 'anonymous' })
                source.decode().then(() => {
                        const texture = textures(key, source)
                        device.queue.copyExternalImageToTexture(
                                { source },
                                { texture: texture.texture },
                                { width: source.width, height: source.height }
                        )
                        state.imageLoading--
                })
        }

        gl.state = {
                uniforms,
                textures,
                attributes,
                bindingManager,
        }

        return { webgpu: state, render, clean, _attribute, _uniform, _texture }
}
