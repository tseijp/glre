import { nested as cached } from 'reev'
import { wgsl } from './code/wgsl'
import { is } from './utils/helpers'
import {
        createPipeline,
        createDescriptor,
        createUniformBuffer,
        createBindGroup,
        createTextureSampler,
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

        const uniformEntries0 = [] as any[]
        const uniformEntries1 = [] as any[]
        const textureEntries0 = [] as any[]
        const textureEntries1 = [] as any[]

        let pipeline: GPUPipeline
        let groups: GPUBindGroup[]
        let lastActive = 0
        let needsUpdate = true
        let stopRender = false
        let hasTexture = false

        const uniformBuffers = cached((_: string, value: number[]) => {
                needsUpdate = true
                const binding = lastActive++
                const { array, buffer } = createUniformBuffer(device, value)
                uniformEntries0.push({ binding, buffer: { type: 'uniform' }, visibility: 3 })
                uniformEntries1.push({ binding, resource: { buffer } })
                return { array, buffer }
        })

        const textureBuffers = cached((_, source: HTMLImageElement) => {
                hasTexture = true
                needsUpdate = true
                const { width, height } = source
                const [texture, sampler] = createTextureSampler(device, width, height)
                textureEntries0.push({ binding: 0, sampler: {}, visibility: 2 })
                textureEntries0.push({ binding: 1, texture: {}, visibility: 2 })
                textureEntries1.push({ binding: 0, resource: sampler }, { binding: 1, resource: texture.createView() })
                return { texture, width, height }
        })

        const update = () => {
                groups = []
                const layouts = []
                {
                        const [layout, group] = createBindGroup(device, uniformEntries0, uniformEntries1)
                        layouts.push(layout)
                        groups.push(group)
                }
                if (hasTexture) {
                        const [layout, group] = createBindGroup(device, textureEntries0, textureEntries1)
                        layouts.push(layout)
                        groups.push(group)
                }
                pipeline = createPipeline(device, format, vs, fs, [], layouts)
        }

        gl('render', () => {
                if (stopRender) return
                if (needsUpdate) update()
                needsUpdate = false
                const encoder = device.createCommandEncoder()
                const pass = encoder.beginRenderPass(createDescriptor(c))
                pass.setPipeline(pipeline)
                groups.forEach((v, i) => pass.setBindGroup(i, v))
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

        gl('_texture', async (alt: string, src: string) => {
                stopRender = true
                const source = Object.assign(new Image(), { src, alt, crossOrigin: 'anonymous' })
                await source.decode()
                const { texture, width, height } = textureBuffers(alt, source)
                device.queue.copyExternalImageToTexture({ source }, { texture }, { width, height })
                stopRender = false
        })

        return gl
}
