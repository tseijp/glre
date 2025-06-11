// WebGPUデバイス管理
export const requestWebGPUDevice = async (): Promise<{
        adapter: any // GPUAdapter @TODO FIX
        device: any // GPUDevice @TODO FIX
}> => {
        // @ts-ignore @TODO FIX
        if (!navigator.gpu)
                throw new Error('WebGPU is not supported in this browser')
        // @ts-ignore
        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter) throw new Error('Failed to get WebGPU adapter')
        const device = await adapter.requestDevice()
        if (!device) throw new Error('Failed to get WebGPU device')
        return { adapter, device }
}

// WebGPUデバイスの機能チェック
export const checkWebGPUSupport = (): boolean => {
        return 'gpu' in navigator
}

// デバイスの制限情報を取得
export const getDeviceLimits = (device: any) => {
        return {
                maxTextureDimension1D: device.limits.maxTextureDimension1D,
                maxTextureDimension2D: device.limits.maxTextureDimension2D,
                maxTextureDimension3D: device.limits.maxTextureDimension3D,
                maxTextureArrayLayers: device.limits.maxTextureArrayLayers,
                maxBindGroups: device.limits.maxBindGroups,
                maxDynamicUniformBuffersPerPipelineLayout:
                        device.limits.maxDynamicUniformBuffersPerPipelineLayout,
                maxDynamicStorageBuffersPerPipelineLayout:
                        device.limits.maxDynamicStorageBuffersPerPipelineLayout,
                maxSampledTexturesPerShaderStage:
                        device.limits.maxSampledTexturesPerShaderStage,
                maxSamplersPerShaderStage:
                        device.limits.maxSamplersPerShaderStage,
                maxStorageBuffersPerShaderStage:
                        device.limits.maxStorageBuffersPerShaderStage,
                maxStorageTexturesPerShaderStage:
                        device.limits.maxStorageTexturesPerShaderStage,
                maxUniformBuffersPerShaderStage:
                        device.limits.maxUniformBuffersPerShaderStage,
                maxUniformBufferBindingSize:
                        device.limits.maxUniformBufferBindingSize,
                maxStorageBufferBindingSize:
                        device.limits.maxStorageBufferBindingSize,
                maxVertexBuffers: device.limits.maxVertexBuffers,
                maxVertexAttributes: device.limits.maxVertexAttributes,
                maxVertexBufferArrayStride:
                        device.limits.maxVertexBufferArrayStride,
                maxComputeWorkgroupStorageSize:
                        device.limits.maxComputeWorkgroupStorageSize,
                maxComputeInvocationsPerWorkgroup:
                        device.limits.maxComputeInvocationsPerWorkgroup,
                maxComputeWorkgroupSizeX:
                        device.limits.maxComputeWorkgroupSizeX,
                maxComputeWorkgroupSizeY:
                        device.limits.maxComputeWorkgroupSizeY,
                maxComputeWorkgroupSizeZ:
                        device.limits.maxComputeWorkgroupSizeZ,
                maxComputeWorkgroupsPerDimension:
                        device.limits.maxComputeWorkgroupsPerDimension,
        }
}

// デバイスエラーハンドリング
export const setupDeviceErrorHandling = (device: any) => {
        device.addEventListener('uncapturederror', (event: any) => {
                console.error('WebGPU uncaptured error:', event.error)
        })
}

// キャンバスコンテキストの設定
export const configureCanvasContext = (
        canvas: HTMLCanvasElement,
        device: any,
        format: any = 'bgra8unorm'
) => {
        const context = canvas.getContext('webgpu')
        if (!context) throw new Error('Failed to get WebGPU canvas context')

        // @ts-ignore
        context.configure({
                device,
                format,
                alphaMode: 'premultiplied',
        })

        return context
}
