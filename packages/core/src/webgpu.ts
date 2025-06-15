import { nested as cached } from 'reev'
import { is } from './utils/helpers'
import {
        createDevive,
        createPipeline,
        createDescriptor,
        createUniformBuffer,
        createBindGroup,
        createTextureSampler,
        createVertexBuffer,
        createBufferLayout,
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

        let bindGroups = [] as any[]
        let vertexBuffers: any[] = []
        const bufferLayouts: any[] = []

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
                const bindGroupLayouts = [] as any
                bindGroups = []
                state.resources.forEach((resource) => {
                        if (!resource.length) return
                        const { layout, bindGroup } = createBindGroup(device, resource)
                        bindGroupLayouts.push(layout)
                        bindGroups.push(bindGroup)
                })
                state.pipeline = createPipeline(device, format, bufferLayouts, bindGroupLayouts, gl.vs, gl.fs)
        }

        const render = () => {
                if (state.loadingImg) return // ignore if loading img
                if (state.needsUpdate) update() // first rendering
                state.needsUpdate = false
                const encoder = device.createCommandEncoder()
                const pass = encoder.beginRenderPass(createDescriptor(c))
                pass.setPipeline(state.pipeline)
                bindGroups.forEach((v, i) => pass.setBindGroup(i, v))
                vertexBuffers.forEach((v, i) => pass.setVertexBuffer(i, v))
                pass.draw(gl.count, 1, 0, 0)
                pass.end()
                device.queue.submit([encoder.finish()])
        }

        const clean = () => {}

        const attributes = cached((_, value: number[]) => {
                const { array, buffer } = createVertexBuffer(device, value)
                vertexBuffers.push(buffer)
                bufferLayouts.push(createBufferLayout(bufferLayouts.length, array.length, gl.count))
                state.needsUpdate = true
                return { array, buffer }
        })

        const _attribute = (key = '', value: number[]) => {
                const { array, buffer } = attributes(key, value)
                device.queue.writeBuffer(buffer, 0, array)
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
