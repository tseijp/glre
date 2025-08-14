import { nested as cached } from 'reev'

export const createRenderBundleManager = (device: GPUDevice) => {
        const bundles = cached((id: string) => ({
                id,
                bundle: null as GPURenderBundle | null,
                encoder: null as GPURenderBundleEncoder | null,
                isRecording: false,
                commands: [] as string[]
        }))

        const createBundle = (
                id: string,
                bindGroupLayouts: GPUBindGroupLayout[],
                colorFormats: GPUTextureFormat[]
        ) => {
                const bundleDesc: GPURenderBundleEncoderDescriptor = {
                        colorFormats,
                        depthStencilFormat: 'depth24plus'
                }
                const encoder = device.createRenderBundleEncoder(bundleDesc)
                const bundleData = bundles(id)
                bundleData.encoder = encoder
                bundleData.isRecording = true
                bundleData.commands = []
                return encoder
        }

        const recordPipelineCommands = (
                bundleId: string,
                pipeline: GPURenderPipeline,
                bindGroups: GPUBindGroup[],
                vertexBuffers: GPUBuffer[],
                vertexCount: number,
                instanceCount: number = 1
        ) => {
                const bundleData = bundles(bundleId)
                if (!bundleData.encoder || !bundleData.isRecording) return

                const encoder = bundleData.encoder
                encoder.setPipeline(pipeline)
                bindGroups.forEach((bindGroup, index) => {
                        if (bindGroup) encoder.setBindGroup(index, bindGroup)
                })
                vertexBuffers.forEach((buffer, index) => {
                        encoder.setVertexBuffer(index, buffer)
                })
                encoder.draw(vertexCount, instanceCount, 0, 0)
                
                bundleData.commands.push(`setPipeline-${pipeline.label || 'unnamed'}`)
                bundleData.commands.push(`draw-${vertexCount}-${instanceCount}`)
        }

        const finishBundle = (id: string) => {
                const bundleData = bundles(id)
                if (!bundleData.encoder || !bundleData.isRecording) return null

                bundleData.bundle = bundleData.encoder.finish()
                bundleData.isRecording = false
                bundleData.encoder = null
                return bundleData.bundle
        }

        const executeBundle = (pass: GPURenderPassEncoder, bundleId: string) => {
                const bundleData = bundles(bundleId)
                if (!bundleData.bundle) return

                pass.executeBundles([bundleData.bundle])
        }

        const executeBundles = (pass: GPURenderPassEncoder, bundleIds: string[]) => {
                const validBundles = bundleIds
                        .map(id => bundles(id).bundle)
                        .filter(bundle => bundle !== null) as GPURenderBundle[]
                
                if (validBundles.length > 0) {
                        pass.executeBundles(validBundles)
                }
        }

        const createOptimizedBundleSequence = (
                bundleConfigs: Array<{
                        id: string
                        pipeline: GPURenderPipeline
                        bindGroups: GPUBindGroup[]
                        vertexBuffers: GPUBuffer[]
                        vertexCount: number
                        instanceCount?: number
                }>
        ) => {
                const sortedConfigs = bundleConfigs.sort((a, b) => {
                        if (a.pipeline === b.pipeline) return 0
                        return a.pipeline.label?.localeCompare(b.pipeline.label || '') || 0
                })

                const bundleEncoder = device.createRenderBundleEncoder({
                        colorFormats: ['rgba8unorm'],
                        depthStencilFormat: 'depth24plus'
                })

                let currentPipeline: GPURenderPipeline | null = null
                
                sortedConfigs.forEach(config => {
                        if (currentPipeline !== config.pipeline) {
                                bundleEncoder.setPipeline(config.pipeline)
                                currentPipeline = config.pipeline
                        }
                        
                        config.bindGroups.forEach((bindGroup, index) => {
                                if (bindGroup) bundleEncoder.setBindGroup(index, bindGroup)
                        })
                        
                        config.vertexBuffers.forEach((buffer, index) => {
                                bundleEncoder.setVertexBuffer(index, buffer)
                        })
                        
                        bundleEncoder.draw(
                                config.vertexCount,
                                config.instanceCount || 1,
                                0,
                                0
                        )
                })

                return bundleEncoder.finish()
        }

        const createStaticSceneBundle = (
                renderCommands: Array<{
                        pipeline: GPURenderPipeline
                        bindGroups: GPUBindGroup[]
                        vertexBuffers: GPUBuffer[]
                        indexBuffer?: GPUBuffer
                        vertexCount: number
                        instanceCount?: number
                }>
        ) => {
                const encoder = device.createRenderBundleEncoder({
                        colorFormats: ['rgba8unorm'],
                        depthStencilFormat: 'depth24plus'
                })

                renderCommands.forEach(command => {
                        encoder.setPipeline(command.pipeline)
                        command.bindGroups.forEach((bindGroup, index) => {
                                encoder.setBindGroup(index, bindGroup)
                        })
                        command.vertexBuffers.forEach((buffer, index) => {
                                encoder.setVertexBuffer(index, buffer)
                        })
                        if (command.indexBuffer) {
                                encoder.setIndexBuffer(command.indexBuffer, 'uint16')
                                encoder.drawIndexed(command.vertexCount, command.instanceCount || 1, 0, 0, 0)
                        } else {
                                encoder.draw(command.vertexCount, command.instanceCount || 1, 0, 0)
                        }
                })

                return encoder.finish()
        }

        const clean = () => {
                for (const bundleData of bundles.map.values()) {
                        if (bundleData.bundle) {
                                bundleData.bundle = null
                        }
                }
        }

        return {
                createBundle,
                recordPipelineCommands,
                finishBundle,
                executeBundle,
                executeBundles,
                createOptimizedBundleSequence,
                createStaticSceneBundle,
                bundles,
                clean
        }
}