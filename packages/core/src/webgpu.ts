import { nested as cached } from 'reev'
import { wgsl } from './code/wgsl'
import { is } from './utils/helpers'
import {
        createPipeline,
        createDescriptor,
        createUniformBuffer,
        // createUniformBuffer,
        // updateBindGroup,
        // createVertexBuffer,
        // createUniform,
        // createDeviceTexture,
        // createSampler,
} from './utils/pipeline'
import type { X } from './node'
import type { GL, GPUBindGroup, GPUPipeline } from './types'

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

        let pipeline: GPUPipeline
        let bindGroup: GPUBindGroup
        let lastActive = 0
        let needsUpdate = true

        const entries0 = [] as any[]
        const entries1 = [] as any[]

        const uniformBuffers = cached((_: string, value: number[]) => {
                needsUpdate = true
                const binding = lastActive++
                const { array, buffer } = createUniformBuffer(device, value)
                entries0.push({ binding, buffer: { type: 'uniform' }, visibility: 3 })
                entries1.push({ binding, resource: { buffer } })
                return { array, buffer }
        })

        gl('render', () => {
                if (needsUpdate) {
                        needsUpdate = false
                        const layout = device.createBindGroupLayout({ entries: entries0 })
                        bindGroup = device.createBindGroup({ layout, entries: entries1 })
                        pipeline = createPipeline(device, format, vs, fs, [], [layout])
                }
                const encoder = device.createCommandEncoder()
                const pass = encoder.beginRenderPass(createDescriptor(c))
                pass.setPipeline(pipeline)
                pass.setBindGroup(0, bindGroup)
                pass.draw(quadVertexCount, 1, 0, 0)
                pass.end()
                device.queue.submit([encoder.finish()])
        })

        gl('clean', () => {})

        gl('_attribute', (key = '', value: number[]) => {
                // @TODO FIX
                // vertexBuffers(key, value)
        })

        gl('_uniform', (key: string, value: number | number[]) => {
                if (is.num(value)) value = [value]
                const { array, buffer } = uniformBuffers(key, value)
                array.set(value)
                device.queue.writeBuffer(buffer, 0, array)
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
