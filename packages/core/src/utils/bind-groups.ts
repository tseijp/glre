import { nested as cached } from 'reev'
import { createArrayBuffer } from './pipeline'

export const createBindGroupManager = (device: GPUDevice) => {
        const frameUniforms = cached((key: string, value: number[]) => {
                const { array, buffer } = createArrayBuffer(device, value, 'uniform')
                return { array, buffer, binding: 0, group: 0 }
        })

        const objectUniforms = cached((key: string, value: number[]) => {
                const { array, buffer } = createArrayBuffer(device, value, 'uniform')
                return { array, buffer, binding: 0, group: 1 }
        })

        const materialUniforms = cached((key: string, value: number[]) => {
                const { array, buffer } = createArrayBuffer(device, value, 'uniform')
                return { array, buffer, binding: 0, group: 2 }
        })

        const textures = cached((key: string, texture: GPUTexture, sampler: GPUSampler) => {
                return {
                        texture,
                        sampler,
                        view: texture.createView(),
                        binding: 0,
                        group: 3
                }
        })

        const updateFrameUniform = (key: string, value: number[]) => {
                const uniform = frameUniforms(key, value)
                uniform.array.set(value)
                device.queue.writeBuffer(uniform.buffer, 0, uniform.array)
        }

        const updateObjectUniform = (key: string, value: number[]) => {
                const uniform = objectUniforms(key, value)
                uniform.array.set(value)
                device.queue.writeBuffer(uniform.buffer, 0, uniform.array)
        }

        const updateMaterialUniform = (key: string, value: number[]) => {
                const uniform = materialUniforms(key, value)
                uniform.array.set(value)
                device.queue.writeBuffer(uniform.buffer, 0, uniform.array)
        }

        const createHierarchicalBindGroups = () => {
                const frameBindGroupLayout = device.createBindGroupLayout({
                        entries: Array.from(frameUniforms.map.values()).map((uniform, index) => ({
                                binding: index,
                                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                                buffer: { type: 'uniform' as const }
                        }))
                })

                const objectBindGroupLayout = device.createBindGroupLayout({
                        entries: Array.from(objectUniforms.map.values()).map((uniform, index) => ({
                                binding: index,
                                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                                buffer: { type: 'uniform' as const }
                        }))
                })

                const materialBindGroupLayout = device.createBindGroupLayout({
                        entries: [
                                ...Array.from(materialUniforms.map.values()).map((uniform, index) => ({
                                        binding: index,
                                        visibility: GPUShaderStage.FRAGMENT,
                                        buffer: { type: 'uniform' as const }
                                })),
                                ...Array.from(textures.map.values()).map((texture, index) => [
                                        {
                                                binding: materialUniforms.map.size + index * 2,
                                                visibility: GPUShaderStage.FRAGMENT,
                                                sampler: {}
                                        },
                                        {
                                                binding: materialUniforms.map.size + index * 2 + 1,
                                                visibility: GPUShaderStage.FRAGMENT,
                                                texture: {}
                                        }
                                ]).flat()
                        ]
                })

                const frameBindGroup = device.createBindGroup({
                        layout: frameBindGroupLayout,
                        entries: Array.from(frameUniforms.map.values()).map((uniform, index) => ({
                                binding: index,
                                resource: { buffer: uniform.buffer }
                        }))
                })

                const objectBindGroup = device.createBindGroup({
                        layout: objectBindGroupLayout,
                        entries: Array.from(objectUniforms.map.values()).map((uniform, index) => ({
                                binding: index,
                                resource: { buffer: uniform.buffer }
                        }))
                })

                const materialBindGroup = device.createBindGroup({
                        layout: materialBindGroupLayout,
                        entries: [
                                ...Array.from(materialUniforms.map.values()).map((uniform, index) => ({
                                        binding: index,
                                        resource: { buffer: uniform.buffer }
                                })),
                                ...Array.from(textures.map.values()).map((texture, index) => [
                                        {
                                                binding: materialUniforms.map.size + index * 2,
                                                resource: texture.sampler
                                        },
                                        {
                                                binding: materialUniforms.map.size + index * 2 + 1,
                                                resource: texture.view
                                        }
                                ]).flat()
                        ]
                })

                return {
                        bindGroups: [frameBindGroup, objectBindGroup, materialBindGroup],
                        bindGroupLayouts: [frameBindGroupLayout, objectBindGroupLayout, materialBindGroupLayout]
                }
        }

        const clean = () => {
                for (const { buffer } of frameUniforms.map.values()) buffer.destroy()
                for (const { buffer } of objectUniforms.map.values()) buffer.destroy()
                for (const { buffer } of materialUniforms.map.values()) buffer.destroy()
                for (const { texture } of textures.map.values()) texture.destroy()
        }

        return {
                updateFrameUniform,
                updateObjectUniform,
                updateMaterialUniform,
                createHierarchicalBindGroups,
                frameUniforms,
                objectUniforms,
                materialUniforms,
                textures,
                clean
        }
}