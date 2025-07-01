import { fragment, isNodeProxy, vertex } from '../node'
import type { NodeProxy } from '../node'
import type { AttribData, TextureData, UniformData, WebGPUState } from '../types'

const defaultVertexWGSL = `
@vertex
fn main(@builtin(vertex_index) vertex_index: u32) -> @builtin(position) vec4f {
  let x = f32(vertex_index % 2u) * 4.0 - 1.0;
  let y = f32(vertex_index / 2u) * 4.0 - 1.0;
  return vec4f(x, y, 0.0, 1.0);
}
`

const defaultFragmentWGSL = `
@group(0) @binding(0) var<uniform> iResolution: vec2f;

@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
  return vec4f(position.xy / iResolution, 0.0, 1.0);
}
`

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
                        const baseGroup = Math.ceil(uniform / 12)
                        const group = baseGroup + Math.floor(texture / 12)
                        const binding = texture % 12
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
        vs: string | NodeProxy = defaultVertexWGSL,
        fs: string | NodeProxy = defaultFragmentWGSL
) => {
        const config = { isWebGL: false, webgpu }
        if (isNodeProxy(vs)) vs = vertex(vs, config)
        if (isNodeProxy(fs)) fs = fragment(fs, config)
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

export const createDescriptor = (c: GPUCanvasContext) => {
        return {
                colorAttachments: [
                        {
                                view: c.getCurrentTexture().createView(),
                                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                                loadOp: 'clear' as GPULoadOp,
                                storeOp: 'store' as GPUStoreOp,
                        },
                ],
        } as GPURenderPassDescriptor
}

export const createTextureSampler = (device: GPUDevice, width = 1280, height = 800) => {
        const texture = device.createTexture({ size: [width, height], format: 'rgba8unorm', usage: 22 }) // 22 is GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        const sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' })
        return { texture, sampler }
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
