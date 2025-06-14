import { nested as cached } from 'reev'
import { wgsl } from './code/wgsl'
import { flush, is } from './utils/helpers'
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
        let bindGroups: GPUBindGroup[]
        let lastActive = 0
        let needsUpdate = true
        let hasTexture = false

        const entries0 = [] as any[]
        const entries1 = [] as any[]
        const textureEntries0 = [] as any[]
        const textureEntries1 = [] as any[]

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
                        bindGroups = []
                        needsUpdate = false
                        const layout0 = device.createBindGroupLayout({ entries: entries0 })
                        bindGroups.push(device.createBindGroup({ layout: layout0, entries: entries1 }))
                        const layouts = [layout0]

                        if (hasTexture) {
                                const layout1 = device.createBindGroupLayout({ entries: textureEntries0 })
                                bindGroups.push(device.createBindGroup({ layout: layout1, entries: textureEntries1 }))
                                layouts.push(layout1)
                        }

                        pipeline = createPipeline(device, format, vs, fs, [], layouts)
                }
                const encoder = device.createCommandEncoder()
                const pass = encoder.beginRenderPass(createDescriptor(c))
                pass.setPipeline(pipeline)
                bindGroups.forEach((v, i) => pass.setBindGroup(i, v))
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

        // const _loadFun = (source: HTMLImageElement, gl: GL) => {
        //         const texture = createDeviceTexture(device, source)
        //         // bindGroup = updateBindGroup(device, pipeline, buffer, textures, sampler)
        // }

        gl('_texture', async (_: string, src: string) => {
                const source = new Image()
                source.crossOrigin = 'anonymous'
                source.src = src
                await source.decode()
                const { width, height } = source

                const texture = device.createTexture({ size: [width, height], format: 'rgba8unorm', usage: 22 })
                const sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' })

                hasTexture = true
                needsUpdate = true
                textureEntries0.push({ binding: 0, sampler: {}, visibility: 2 })
                textureEntries0.push({ binding: 1, texture: {}, visibility: 2 })
                textureEntries1.push({ binding: 0, resource: sampler }, { binding: 1, resource: texture.createView() })
                device.queue.copyExternalImageToTexture({ source }, { texture }, { width, height })
        })

        return gl
}
