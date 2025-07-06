import { fragment, vertex } from '../node'
import type { X } from '../node'
import type { AttribData, TextureData, UniformData, WebGPUState } from '../types'
import { is } from './helpers'

/**
 * initialize
 */
export const createDevice = async (c: GPUCanvasContext) => {
        const gpu = navigator.gpu
        const format = gpu.getPreferredCanvasFormat()
        const adapter = await gpu.requestAdapter()
        const device = await adapter!.requestDevice()
        c.configure({ device, format, alphaMode: 'opaque' })
        return { device, format }
}

export const createBindings = () => {
        let uniform = 0
        let texture = 0
        let attrib = 0
        return {
                uniform: () => {
                        const group = Math.floor(uniform / 12)
                        const binding = uniform % 12
                        uniform++
                        return { group, binding }
                },
                texture: () => {
                        const baseGroup = Math.floor(uniform / 12) + 1
                        const group = baseGroup + Math.floor(texture / 6)
                        const binding = (texture % 6) * 2
                        texture++
                        return { group, binding }
                },
                attrib: () => {
                        const location = attrib
                        attrib++
                        return { location }
                },
        }
}

export const createPipeline = (
        device: GPUDevice,
        format: GPUTextureFormat,
        bufferLayouts: GPUVertexBufferLayout[],
        bindGroupLayouts: GPUBindGroupLayout[],
        webgpu: WebGPUState,
        vs: string | X,
        fs: string | X
) => {
        const config = { isWebGL: false, webgpu }
        if (!is.str(fs)) fs = fragment(fs, config)
        if (!is.str(vs)) vs = vertex(vs, config)
        const layout = device.createPipelineLayout({ bindGroupLayouts })
        return device.createRenderPipeline({
                vertex: {
                        module: device.createShaderModule({ code: vs.trim() }),
                        entryPoint: 'main',
                        buffers: bufferLayouts,
                },
                fragment: {
                        module: device.createShaderModule({ code: fs.trim() }),
                        entryPoint: 'main',
                        targets: [{ format }],
                },
                layout,
                primitive: { topology: 'triangle-list' },
                depthStencil: {
                        depthWriteEnabled: true,
                        depthCompare: 'less',
                        format: 'depth24plus',
                },
        })
}

/**
 * buffers
 */
export const createUniformBuffer = (device: GPUDevice, value: number[]) => {
        const array = new Float32Array(value)
        const size = Math.ceil(array.byteLength / 256) * 256
        const buffer = device.createBuffer({ size, usage: 72 }) // 72 is GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        return { array, buffer }
}

export const createAttribBuffer = (device: GPUDevice, value: number[]) => {
        const array = new Float32Array(value)
        const buffer = device.createBuffer({ size: array.byteLength, usage: 40 }) // 40 is GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        return { array, buffer }
}

/**
 * uniforms
 */
export const createBindGroup = (
        device: GPUDevice,
        uniforms: Map<string, UniformData>,
        textures: Map<string, TextureData>
) => {
        const groups = new Map<number, any>()
        const getGroup = (i = 0) => {
                if (!groups.has(i)) groups.set(i, { entries0: [], entries1: [] })
                return groups.get(i)
        }
        for (const { binding, buffer, group: i } of uniforms.values()) {
                const { entries0, entries1 } = getGroup(i)
                entries0.push({ binding, visibility: 3, buffer: { type: 'uniform' } })
                entries1.push({ binding, resource: { buffer } })
        }
        for (const { binding, group: i, sampler, texture } of textures.values()) {
                const { entries0, entries1 } = getGroup(i)
                entries0.push({ binding, visibility: 2, sampler: {} })
                entries0.push({ binding: binding + 1, visibility: 2, texture: {} })
                entries1.push({ binding, resource: sampler })
                entries1.push({ binding: binding + 1, resource: texture.createView() })
        }
        const ret = { bindGroups: [] as GPUBindGroup[], bindGroupLayouts: [] as GPUBindGroupLayout[] }
        for (const [i, { entries0, entries1 }] of groups) {
                ret.bindGroupLayouts[i] = device.createBindGroupLayout({ entries: entries0 })
                ret.bindGroups[i] = device.createBindGroup({ layout: ret.bindGroupLayouts[i], entries: entries1 })
        }
        return ret
}

export const createDescriptor = (c: GPUCanvasContext, depthTexture: GPUTexture) => {
        return {
                colorAttachments: [
                        {
                                view: c.getCurrentTexture().createView(),
                                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                                loadOp: 'clear' as GPULoadOp,
                                storeOp: 'store' as GPUStoreOp,
                        },
                ],
                depthStencilAttachment: {
                        view: depthTexture.createView(),
                        depthClearValue: 1.0,
                        depthLoadOp: 'clear' as GPULoadOp,
                        depthStoreOp: 'store' as GPUStoreOp,
                },
        } as GPURenderPassDescriptor
}

export const createTextureSampler = (device: GPUDevice, width = 1280, height = 800) => {
        const texture = device.createTexture({ size: [width, height], format: 'rgba8unorm', usage: 22 }) // 22 is GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        const sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' })
        return { texture, sampler }
}

export const createDepthTexture = (device: GPUDevice, width: number, height: number) => {
        return device.createTexture({
                size: [width, height],
                format: 'depth24plus',
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
        })
}

/**
 * attribs
 */
const getVertexFormat = (stride: number): GPUVertexFormat => {
        if (stride === 2) return 'float32x2'
        if (stride === 3) return 'float32x3'
        if (stride === 4) return 'float32x4'
        return 'float32'
}

export const createVertexBuffers = (attribs: Map<string, AttribData>) => {
        const vertexBuffers: GPUBuffer[] = []
        const bufferLayouts: GPUVertexBufferLayout[] = []
        for (const [, { buffer, location, stride }] of attribs) {
                vertexBuffers[location] = buffer
                bufferLayouts[location] = {
                        arrayStride: stride * 4,
                        attributes: [
                                {
                                        shaderLocation: location,
                                        offset: 0,
                                        format: getVertexFormat(stride),
                                },
                        ],
                }
        }
        return { vertexBuffers, bufferLayouts }
}
