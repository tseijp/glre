import { is } from './utils/helpers'
import {
        createDevice,
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
        const { device, format } = await createDevice(c)
        const state = {
                device,
                context: c,
                uniforms: new Map<string, any>(),
                textures: new Map<string, any>(),
                attributes: new Map<string, any>(),
                loadingImg: 0,
                needsUpdate: true,
        } as WebGPUState

        const bindGroups = [] as any[]
        const vertexBuffers = [] as any[]
        const bufferLayouts = [] as any[]

        const initUniformInfo = (key: string, value: number[]) => {
                const { array, buffer } = createUniformBuffer(device, value)
                state.uniforms.set(key, { array, buffer, group: 0, binding: state.uniforms.size })
                state.needsUpdate = true
        }

        const initTextureInfo = (key: string, { width, height }: HTMLImageElement) => {
                const { texture, sampler } = createTextureSampler(device, width, height)
                state.textures.set(key, { texture, sampler, group: 1, binding: state.textures.size * 2, width, height })
                state.needsUpdate = true
        }

        const initAttributeInfo = (key: string, value: number[]) => {
                const { array, buffer } = createVertexBuffer(device, value)
                const location = state.attributes.size
                state.attributes.set(key, { array, buffer, location })
                vertexBuffers.push(buffer)
                bufferLayouts.push(createBufferLayout(location, array.length, gl.count))
                state.needsUpdate = true
        }

        const getUniformInfo = (key: string, value: number[]) => {
                if (!state.uniforms.has(key)) initUniformInfo(key, value)
                return state.uniforms.get(key)!
        }

        const getTextureInfo = (key: string, img: HTMLImageElement) => {
                if (!state.textures.has(key)) initTextureInfo(key, img)
                return state.textures.get(key)!
        }

        const getAttributeInfo = (key: string, value: number[]) => {
                if (!state.attributes.has(key)) initAttributeInfo(key, value)
                return state.attributes.get(key)!
        }

        const createResources = () => {
                const uniformResources = Array.from(state.uniforms.values()).map(({ buffer }) => ({ buffer }))
                const textureResources = [] as any[]
                for (const { sampler, texture } of state.textures.values())
                        textureResources.push(sampler, texture.createView())
                return [uniformResources, textureResources]
        }

        const update = () => {
                const bindGroupLayouts = [] as any
                bindGroups.length = 0
                const resources = createResources()
                resources.forEach((resource) => {
                        if (!resource.length) return
                        const { layout, bindGroup } = createBindGroup(device, resource)
                        bindGroupLayouts.push(layout)
                        bindGroups.push(bindGroup)
                })
                const context = {
                        isWebGL: false,
                        bindings: new Map(Array.from(state.uniforms.entries()).map(([k, v]) => [k, v.binding])),
                        attributes: new Map(Array.from(state.attributes.entries()).map(([k, v]) => [k, v.location])),
                }
                state.pipeline = createPipeline(device, format, bufferLayouts, bindGroupLayouts, gl.vs, gl.fs, context)
        }

        const render = () => {
                if (state.loadingImg) return
                if (state.needsUpdate) update()
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

        const _attribute = (key = '', value: number[]) => {
                const { array, buffer } = getAttributeInfo(key, value)
                device.queue.writeBuffer(buffer, 0, array)
        }

        const _uniform = (key: string, value: number | number[]) => {
                if (is.num(value)) value = [value]
                const { array, buffer } = getUniformInfo(key, value)
                array.set(value)
                device.queue.writeBuffer(buffer, 0, array)
        }

        const _texture = (key: string, src: string) => {
                state.loadingImg++
                const source = Object.assign(new Image(), { src, crossOrigin: 'anonymous' })
                source.decode().then(() => {
                        const { texture, width, height } = getTextureInfo(key, source)
                        device.queue.copyExternalImageToTexture({ source }, { texture }, { width, height })
                        state.loadingImg--
                })
        }

        return { webgpu: state, render, clean, _attribute, _uniform, _texture }
}
