import { nested as cached } from 'reev'
import { is } from './utils/helpers'
import {
        createDevive,
        createPipeline,
        createDescriptor,
        createUniformBuffer,
        createBindGroup,
        createTextureSampler,
} from './utils/pipeline'
import type { GL, WebGPUState } from './types'

export const webgpu = async (gl: Partial<GL>) => {
        const c = gl.el!.getContext('webgpu') as any
        const { device, format } = await createDevive(c)
        const state = {
                device,
                context: c,
                resources: [[], []],
                loadingImg: 0,
                needsUpdate: true,
        } as WebGPUState

        const vertexBuffers = [] as any[]
        const vertexLayouts = [] as any[]

        const uniforms = cached((_, value: number[]) => {
                const { array, buffer } = createUniformBuffer(device, value)
                state.resources[0].push({ buffer })
                state.needsUpdate = true
                return { array, buffer }
        })

        const textures = cached((_, { width, height }: HTMLImageElement) => {
                const { texture, sampler } = createTextureSampler(device, width, height)
                state.resources[1].push(sampler, texture.createView())
                state.needsUpdate = true
                return { texture, width, height }
        })

        const update = () => {
                const layouts = [] as any
                state.groups = []
                state.resources.forEach((resource) => {
                        if (!resource.length) return
                        const { layout, bindGroup } = createBindGroup(device, resource)
                        layouts.push(layout)
                        state.groups.push(bindGroup)
                })
                state.pipeline = createPipeline(device, format, vertexLayouts, layouts, gl.vs, gl.fs)
        }

        const render = () => {
                if (state.loadingImg) return // ignore if loading img
                if (state.needsUpdate) update() // first rendering
                state.needsUpdate = false
                const encoder = device.createCommandEncoder()
                const pass = encoder.beginRenderPass(createDescriptor(c))
                pass.setPipeline(state.pipeline)
                state.groups.forEach((v, i) => pass.setBindGroup(i, v))
                vertexBuffers.forEach((v, i) => pass.setVertexBuffer(i, v))
                pass.draw(gl.count, 1, 0, 0)
                pass.end()
                device.queue.submit([encoder.finish()])
        }

        const clean = () => {}

        const _attribute = (key = '', value: number[]) => {
                const buffer = device.createBuffer({
                        size: value.length * 4,
                        usage: 40, // GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
                })
                device.queue.writeBuffer(buffer, 0, new Float32Array(value))

                // Calculate stride dynamically
                const stride = Math.floor(value.length / gl.count!) * 4
                const format =
                        stride === 8
                                ? 'float32x2'
                                : stride === 12
                                ? 'float32x3'
                                : stride === 16
                                ? 'float32x4'
                                : 'float32'

                // Find existing layout for this key or create new one
                const layoutIndex = vertexBuffers.findIndex((_, i) => i === parseInt(key) || 0)
                if (layoutIndex === -1) {
                        vertexBuffers.push(buffer)
                        vertexLayouts.push({
                                arrayStride: stride,
                                attributes: [
                                        {
                                                shaderLocation: vertexLayouts.length,
                                                offset: 0,
                                                format,
                                        },
                                ],
                        })
                } else {
                        vertexBuffers[layoutIndex] = buffer
                        vertexLayouts[layoutIndex] = {
                                arrayStride: stride,
                                attributes: [
                                        {
                                                shaderLocation: layoutIndex,
                                                offset: 0,
                                                format,
                                        },
                                ],
                        }
                }
                state.needsUpdate = true
        }

        const _uniform = (key: string, value: number | number[]) => {
                if (is.num(value)) value = [value]
                const { array, buffer } = uniforms(key, value)
                array.set(value)
                device.queue.writeBuffer(buffer, 0, array)
        }

        const _texture = (key: string, src: string) => {
                state.loadingImg++
                const source = Object.assign(new Image(), { src, crossOrigin: 'anonymous' })
                source.decode().then(() => {
                        const { texture, width, height } = textures(key, source)
                        device.queue.copyExternalImageToTexture({ source }, { texture }, { width, height })
                        state.loadingImg--
                })
        }

        return { webgpu: state, render, clean, _attribute, _uniform, _texture }
}
