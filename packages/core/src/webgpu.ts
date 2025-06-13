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

        let _bindIndex = 0
        const bindEntries = [] as any
        const uniforms = nested((key, value: number | number[]) => {
                if (is.num(value)) value = [value]
                const data = new Float32Array(value)
                const buffer = device.createBuffer({
                        label: key,
                        size: data.byteLength, // @ts-ignore
                        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                })
                const bindIndex = _bindIndex++
                console.log(bindIndex)
                bindEntries.push({ binding: bindIndex, resource: { buffer } })
                return (next: number | number[]) => {
                        if (is.num(next)) next = [next]
                        data.set(next)
                        device.queue.writeBuffer(buffer, 0, data)
                }
        })

        gl('clean', () => {})

        let bindGroup: GPUBindGroup
        let pipeline: GPUPipeline

        gl('render', () => {
                if (!pipeline) {
                        pipeline = createPipeline(device, format, vs, fs, [])
                        bindGroup = device.createBindGroup({
                                layout: pipeline.getBindGroupLayout(0),
                                entries: bindEntries,
                        })
                }
                const encoder = device.createCommandEncoder()
                const pass = encoder.beginRenderPass(createDescriptor(c))
                pass.setPipeline(pipeline)
                // queue.flush(pass, pipeline) // pass.setBindGroup(0, bindGroup)
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
                uniforms(key, value)(value)
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
