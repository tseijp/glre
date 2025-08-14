import { nested as cached } from 'reev'
import { createArrayBuffer, createBindGroup, createPipeline, createVertexBuffers, createBindings } from './pipeline'
import { createBindGroupManager } from './bind-groups'
import { is } from './helpers'
import type { GL, AttribData, UniformData, TextureData, WebGPUState } from '../types'

export const createMultiPipelineManager = (device: GPUDevice, format: GPUTextureFormat) => {
        const bindGroupManager = createBindGroupManager(device)
        const bindings = createBindings()
        
        const pipelines = cached((id: string) => ({
                id,
                pipeline: null as GPURenderPipeline | null,
                vertexShader: '',
                fragmentShader: '',
                uniforms: new Map<string, UniformData>(),
                attributes: new Map<string, AttribData>(),
                textures: new Map<string, TextureData>(),
                bindGroups: [] as GPUBindGroup[],
                bindGroupLayouts: [] as GPUBindGroupLayout[],
                vertexBuffers: [] as GPUBuffer[],
                bufferLayouts: [] as GPUVertexBufferLayout[],
                needsUpdate: true
        }))

        const createPipelineConfig = (id: string, vs: string, fs: string) => {
                const config = pipelines(id)
                config.vertexShader = vs
                config.fragmentShader = fs
                config.needsUpdate = true
                return config
        }

        const updatePipeline = (id: string) => {
                const config = pipelines(id)
                if (!config.needsUpdate || !config.vertexShader || !config.fragmentShader) return

                const { vertexBuffers, bufferLayouts } = createVertexBuffers(config.attributes.values())
                const { bindGroups, bindGroupLayouts } = createBindGroup(
                        device,
                        config.uniforms.values(),
                        config.textures.values()
                )

                config.pipeline = createPipeline(
                        device,
                        format,
                        bufferLayouts,
                        bindGroupLayouts,
                        config.vertexShader,
                        config.fragmentShader
                )

                config.bindGroups = bindGroups
                config.bindGroupLayouts = bindGroupLayouts
                config.vertexBuffers = vertexBuffers
                config.bufferLayouts = bufferLayouts
                config.needsUpdate = false
        }

        const addUniform = (id: string, key: string, value: number | number[]) => {
                const config = pipelines(id)
                if (is.num(value)) value = [value]
                
                const existingUniform = config.uniforms.get(key)
                if (existingUniform) {
                        existingUniform.array.set(value)
                        device.queue.writeBuffer(existingUniform.buffer, 0, existingUniform.array)
                        return
                }
                
                const { binding, group } = bindings.uniform()
                const { array, buffer } = createArrayBuffer(device, value, 'uniform')
                config.uniforms.set(key, { array, buffer, binding, group })
                config.needsUpdate = true
        }

        const addAttribute = (id: string, key: string, value: number[]) => {
                const config = pipelines(id)
                
                const existingAttribute = config.attributes.get(key)
                if (existingAttribute) {
                        existingAttribute.array.set(value)
                        device.queue.writeBuffer(existingAttribute.buffer, 0, existingAttribute.array)
                        return
                }
                
                const { location } = bindings.attrib()
                const { array, buffer } = createArrayBuffer(device, value, 'attrib')
                const stride = Math.min(Math.max(Math.floor(value.length / (value.length / 4)), 1), 4)
                config.attributes.set(key, { 
                        array, 
                        buffer, 
                        location, 
                        stride,
                        isInstance: false 
                })
                config.needsUpdate = true
        }

        const addTexture = (id: string, key: string, texture: GPUTexture, sampler: GPUSampler) => {
                const config = pipelines(id)
                const { binding, group } = bindings.texture()
                config.textures.set(key, {
                        texture,
                        sampler,
                        view: texture.createView(),
                        binding,
                        group
                })
                config.needsUpdate = true
        }

        const renderPipeline = (pass: GPURenderPassEncoder, id: string, instanceCount: number, vertexCount: number) => {
                const config = pipelines(id)
                updatePipeline(id)
                
                if (!config.pipeline) return

                pass.setPipeline(config.pipeline)
                config.bindGroups.forEach((bindGroup, index) => {
                        if (bindGroup) pass.setBindGroup(index, bindGroup)
                })
                config.vertexBuffers.forEach((buffer, index) => {
                        if (buffer) pass.setVertexBuffer(index, buffer)
                })
                
                const actualVertexCount = config.attributes.size > 0 ? vertexCount : 3
                pass.draw(actualVertexCount, instanceCount, 0, 0)
        }

        const clean = () => {
                bindGroupManager.clean()
                for (const config of pipelines.map.values()) {
                        for (const { buffer } of config.uniforms.values()) buffer.destroy()
                        for (const { buffer } of config.attributes.values()) buffer.destroy()
                        for (const { texture } of config.textures.values()) texture.destroy()
                }
        }

        return {
                createPipelineConfig,
                addUniform,
                addAttribute, 
                addTexture,
                renderPipeline,
                updatePipeline,
                clean,
                pipelines,
                bindGroupManager
        }
}