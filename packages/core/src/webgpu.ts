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
import type { GL, GPUPipeline } from './types'

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

        // Uniform buffer setup
        // WebGPU 16-byte alignment requirement: iTime(4) + padding(12) + iMouse(8) + iPrevTime(4) + iDeltaTime(4) + iResolution(8) = 40 bytes, rounded to 48
        const uniformBufferSize = 128

        const uniformBuffer = device.createBuffer({
                size: uniformBufferSize, // @ts-ignore
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        // Store uniform values
        const uniforms = {
                iResolution: [1280, 800],
                iTime: 0,
                iPrevTime: 0,
                iDeltaTime: 0,
                iMouse: [0, 0],
        }

        gl('clean', () => {})

        let pipeline: GPUPipeline
        let bindGroup: any

        gl('render', () => {
                // first rendering
                if (!pipeline) {
                        pipeline = createPipeline(device, format, vs, fs, [])
                        bindGroup = device.createBindGroup({
                                layout: pipeline.getBindGroupLayout(0),
                                entries: [
                                        {
                                                binding: 0,
                                                resource: { buffer: uniformBuffer },
                                        },
                                ],
                        })
                }
                const encoder = device.createCommandEncoder()
                const pass = encoder.beginRenderPass(createDescriptor(c))
                pass.setPipeline(pipeline)
                pass.setBindGroup(0, bindGroup)
                pass.draw(quadVertexCount, 1, 0, 0)
                pass.end()
                device.queue.submit([encoder.finish()])
        })

        gl('_attribute', (key = '', value: number[]) => {
                // @TODO FIX
                // vertexBuffers(key, value)
        })

        gl('_uniform', (key: string, value: number | number[]) => {
                if (!device || !uniformBuffer) return
                // @ts-ignore
                uniforms[key] = value
                const uniformData = new Float32Array(3)
                uniformData[0] = uniforms.iResolution[0]
                uniformData[1] = uniforms.iResolution[1]
                uniformData[2] = uniforms.iTime
                // const uniformData = new Float32Array(12)
                // uniformData[0] = uniforms.iTime as number
                // uniformData[1] = 0
                // uniformData[2] = 0
                // uniformData[3] = 0
                // uniformData[4] = (uniforms.iMouse as number[])[0]
                // uniformData[5] = (uniforms.iMouse as number[])[1]
                // uniformData[6] = uniforms.iPrevTime as number
                // uniformData[7] = uniforms.iDeltaTime as number
                // uniformData[8] = (uniforms.iResolution as number[])[0]
                // uniformData[9] = (uniforms.iResolution as number[])[1]
                // uniformData[10] = 0
                // uniformData[11] = 0
                device.queue.writeBuffer(uniformBuffer, 0, uniformData)
        })

        // const _loadFun = (image: HTMLImageElement, gl: GL) => {
        //         const texture = createDeviceTexture(device, image)
        //         // bindGroup = updateBindGroup(device, pipeline, uniformBuffer, textures, sampler)
        // }

        gl('_texture', (alt: string, src: string) => {
                // @TODO FIX
                // const image = new Image()
                // image.addEventListener('load', _loadFun.bind(null, image, gl), false)
                // Object.assign(image, { src, alt, crossOrigin: 'anonymous' })
        })

        return gl
}
