import { wgsl } from './code/wgsl'
import { is } from './utils/helpers'
import {
        createPipeline,
        createDescriptor,
        // createUniformBuffer,
        // updateBindGroup,
        // createVertexBuffer,
        // createUniform,
        // createDeviceTexture,
        // createSampler,
} from './utils/pipeline'
import type { X } from './node'
import type { GL, GPUBindGroup, GPUPipeline } from './types'
import { nested } from 'reev'

const quadVertexCount = 3

export const webgpu = async (gl: GL) => {
        let vs = gl.vs || gl.vert || gl.vertex
        let fs = gl.fs || gl.frag || gl.fragment
        if (is.obj(vs)) vs = wgsl(vs as X)
        if (is.obj(fs)) fs = wgsl(fs as X)
        const c = gl.el.getContext('webgpu') as any
        const gpu = (navigator as any).gpu
        const adapter = await gpu.requestAdapter()
        const device = await adapter.requestDevice()
        const format = gpu.getPreferredCanvasFormat()
        c.configure({ device, format, alphaMode: 'opaque' })

        // uniformごとに個別のバッファーを作成
        const uniformBuffers = new Map<
                string,
                {
                        buffer: any
                        binding: number
                        size: number
                }
        >()

        gl('clean', () => {})

        let pipeline: GPUPipeline
        let bindGroup: GPUBindGroup
        let pipelineLayout: any
        let bindGroupLayout: any
        let needsPipelineRecreation = false

        gl('render', () => {
                if (uniformBuffers.size > 0 && (!bindGroupLayout || needsPipelineRecreation)) {
                        // 明示的なbindGroupLayout作成
                        const bindGroupLayoutEntries = Array.from(uniformBuffers.entries()).map(([key, info]) => ({
                                binding: info.binding, // @ts-ignore
                                visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
                                buffer: { type: 'uniform' as const },
                        }))
                        bindGroupLayout = device.createBindGroupLayout({
                                entries: bindGroupLayoutEntries,
                        })
                        pipelineLayout = device.createPipelineLayout({
                                bindGroupLayouts: [bindGroupLayout],
                        })
                }
                if (!pipeline || needsPipelineRecreation) {
                        const layout = pipelineLayout || 'auto'
                        pipeline = createPipeline(device, format, vs, fs, [], layout)
                        needsPipelineRecreation = false
                }
                if (!bindGroup && uniformBuffers.size > 0) {
                        const entries = Array.from(uniformBuffers.entries()).map(([key, info]) => ({
                                binding: info.binding,
                                resource: { buffer: info.buffer },
                        }))
                        bindGroup = device.createBindGroup({
                                layout: bindGroupLayout,
                                entries,
                        })
                }

                const encoder = device.createCommandEncoder()
                const pass = encoder.beginRenderPass(createDescriptor(c))
                pass.setPipeline(pipeline)
                pass.setBindGroup(0, bindGroup)
                pass.draw(quadVertexCount, 1, 0, 0)
                pass.end()
                device.queue.submit([encoder.finish()])
                return true
        })

        gl('_attribute', (key = '', value: number[]) => {
                // @TODO FIX
                // vertexBuffers(key, value)
        })

        gl('_uniform', (key: string, value: number | number[]) => {
                if (!uniformBuffers.has(key)) {
                        needsPipelineRecreation = true
                        bindGroup = null as any
                        bindGroupLayout = null
                        pipelineLayout = null
                        // 新しいuniformの場合、バッファーとbindingを作成
                        const alignedSize = 128 // Math.ceil(size / 16) * 16 // 16byte alignment

                        const buffer = device.createBuffer({
                                size: alignedSize, // @ts-ignore
                                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                        })

                        uniformBuffers.set(key, {
                                buffer,
                                binding: uniformBuffers.size,
                                size: alignedSize,
                        })
                }

                // データ更新
                const uniform = uniformBuffers.get(key)!
                const data = new Float32Array(uniform.size / 4)
                if (Array.isArray(value)) {
                        data.set(value)
                } else {
                        data[0] = value
                }
                device.queue.writeBuffer(uniform.buffer, 0, data)
        })

        // const _loadFun = (image: HTMLImageElement, gl: GL) => {
        //         const texture = createDeviceTexture(device, image)
        //         // bindGroup = updateBindGroup(device, pipeline, buffer, textures, sampler)
        // }

        gl('_texture', (alt: string, src: string) => {
                // @TODO FIX
                // const image = new Image()
                // image.addEventListener('load', _loadFun.bind(null, image, gl), false)
                // Object.assign(image, { src, alt, crossOrigin: 'anonymous' })
        })

        return gl
}
