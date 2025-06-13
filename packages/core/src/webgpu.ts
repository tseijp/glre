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

        // Uniform buffer setup
        // WebGPU 16-byte alignment requirement: iTime(4) + padding(12) + iMouse(8) + iPrevTime(4) + iDeltaTime(4) + iResolution(8) = 40 bytes, rounded to 48

        const buffer = device.createBuffer({
                size: 64, // @ts-ignore
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        gl('clean', () => {})

        const activeUnit = nested((_, size) => (_activeUnit += size))
        let _activeUnit = 0
        let pipeline: GPUPipeline
        let bindGroup: GPUBindGroup
        let uniformData = new Float32Array(0)

        gl('render', () => {
                if (!pipeline) {
                        pipeline = createPipeline(device, format, vs, fs, [])
                        bindGroup = device.createBindGroup({
                                layout: pipeline.getBindGroupLayout(0),
                                entries: [
                                        {
                                                binding: 0,
                                                resource: { buffer },
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
                return true
        })

        gl('_attribute', (key = '', value: number[]) => {
                // @TODO FIX
                // vertexBuffers(key, value)
        })

        gl('_uniform', (key: string, value: number | number[]) => {
                if (is.num(value)) value = [value]
                const size = value.length
                const unit = activeUnit(key, size)
                if (unit === _activeUnit) {
                        const array = new Float32Array(_activeUnit)
                        if (uniformData) array.set(uniformData)
                        uniformData = array
                }
                for (let i = 0; i < size; i++) uniformData[unit - size + i] = value[i]
                device.queue.writeBuffer(buffer, 0, uniformData)
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
