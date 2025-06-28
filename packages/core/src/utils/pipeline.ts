import { fragment, isNodeProxy, vertex } from '../node'
import type { NodeProxy } from '../node'
import type { GPUContext, GPUDevice, GPUPipeline } from '../types'

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
export const createDevice = async (c: GPUContext) => {
        const gpu = (navigator as any).gpu
        const format = gpu.getPreferredCanvasFormat()
        const adapter = await gpu.requestAdapter()
        const device = await adapter.requestDevice()
        c.configure({ device, format, alphaMode: 'opaque' })
        return { device, format }
}

export const createPipeline = (
        device: GPUDevice,
        format: string,
        bufferLayouts: any[],
        bindGroupLayouts: any[],
        vs: string | NodeProxy = defaultVertexWGSL,
        fs: string | NodeProxy = defaultFragmentWGSL,
        gl?: any
) => {
        const config = { isWebGL: false, gl }
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
        }) as GPUPipeline
}

// export const createBindGroup = (device: GPUDevice, resources: any[]) => {
//         const entries0 = [] as any[]
//         const entries1 = [] as any[]
//         resources.forEach((resource, binding) => {
//                 if (!resource) return
//                 const isUniform = 'buffer' in resource // @ts-ignore
//                 const isTexture = resource instanceof GPUTextureView // @ts-ignore
//                 const isSampler = resource instanceof GPUSampler // @ts-ignore
//                 if (isUniform) entries0.push({ binding, visibility: 3, buffer: { type: 'uniform' } })
//                 else if (isTexture) entries0.push({ binding, visibility: 2, texture: {} })
//                 else if (isSampler) entries0.push({ binding, visibility: 2, sampler: {} })
//                 else return
//                 entries1.push({ binding, resource })
//         })
//         const layout = device.createBindGroupLayout({ entries: entries0 })
//         const bindGroup = device.createBindGroup({ layout, entries: entries1 })
//         return { layout, bindGroup }
// }

/**
 * buffers
 */
const alignTo256 = (size: number) => Math.ceil(size / 256) * 256

export const createUniformBuffer = (device: GPUDevice, value: number[]) => {
        const array = new Float32Array(value)
        const size = alignTo256(array.byteLength)
        const buffer = device.createBuffer({ size, usage: 72 }) as Buffer // 72 === GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        return { array, buffer }
}

export const createAttribBuffer = (device: GPUDevice, value: number[]) => {
        const array = new Float32Array(value)
        const buffer = device.createBuffer({ size: array.byteLength, usage: 40 }) // 40 === // GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        return { array, buffer }
}

export const createBindingManager = () => {
        let uniformCount = 0
        let textureCount = 0
        let attributeCount = 0
        return {
                nextUniform: () => {
                        const group = Math.floor(uniformCount / 12)
                        const binding = uniformCount % 12
                        uniformCount++
                        return { group, binding }
                },
                nextTexture: () => {
                        const baseGroup = Math.ceil(uniformCount / 12)
                        const group = baseGroup + Math.floor(textureCount / 12)
                        const binding = textureCount % 12
                        textureCount++
                        return { group, binding }
                },
                nextAttribute: () => {
                        const location = attributeCount
                        attributeCount++
                        return { location }
                },
        }
}

/**
 * uniforms
 */
export const createBindGroup = (device: any, uniforms: Map<string, any>, textures: Map<string, any>) => {
        const groupedResources = new Map<number, { binding: number; resource: any; type: string }[]>()
        for (const [, uniform] of uniforms) {
                if (!groupedResources.has(uniform.group)) groupedResources.set(uniform.group, [])
                groupedResources.get(uniform.group)!.push({
                        binding: uniform.binding,
                        resource: { buffer: uniform.buffer },
                        type: 'uniform',
                })
        }
        for (const [, texture] of textures) {
                if (!groupedResources.has(texture.group)) groupedResources.set(texture.group, [])
                const group = groupedResources.get(texture.group)!
                group.push({ binding: texture.binding, resource: texture.sampler, type: 'sampler' })
                group.push({ binding: texture.binding + 1, resource: texture.texture.createView(), type: 'texture' })
        }
        const bindGroups = []
        const bindGroupLayouts = []
        for (const [groupIndex, resources] of groupedResources) {
                const entries0 = []
                const entries1 = []
                for (const { binding, resource, type } of resources) {
                        if (type === 'uniform') entries0.push({ binding, visibility: 3, buffer: { type: 'uniform' } })
                        else if (type === 'texture') entries0.push({ binding, visibility: 2, texture: {} })
                        else if (type === 'sampler') entries0.push({ binding, visibility: 2, sampler: {} })
                        entries1.push({ binding, resource })
                }
                const layout = device.createBindGroupLayout({ entries: entries0 })
                const bindGroup = device.createBindGroup({ layout, entries: entries1 })
                bindGroupLayouts[groupIndex] = layout
                bindGroups[groupIndex] = bindGroup
        }

        return { bindGroups, bindGroupLayouts }
}
export const createDescriptor = (c: GPUContext) => {
        return {
                colorAttachments: [
                        {
                                view: c.getCurrentTexture().createView(),
                                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                                loadOp: 'clear',
                                storeOp: 'store',
                        },
                ],
        }
}

export const createTextureSampler = (device: GPUDevice, width = 1280, height = 800) => {
        const texture = device.createTexture({ size: [width, height], format: 'rgba8unorm', usage: 22 })
        const sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' })
        return { texture, sampler }
}

/**
 * attributes
 */
const getVertexStride = (dataLength: number, vertexCount: number) => {
        return dataLength / vertexCount
}

const getVertexFormat = (stride: number) => {
        if (stride === 2) return 'float32x2'
        if (stride === 3) return 'float32x3'
        if (stride === 4) return 'float32x4'
        return 'float32'
}

const createBufferLayout = (shaderLocation: number, dataLength: number, count = 6) => {
        const stride = getVertexStride(dataLength, count)
        return {
                arrayStride: stride * 4,
                attributes: [
                        {
                                shaderLocation,
                                offset: 0,
                                format: getVertexFormat(stride),
                        },
                ],
        }
}

export const createVertexBuffers = (attributes: any, count = 6) => {
        const vertexBuffers = []
        const bufferLayouts = []
        for (const [, { array, buffer, location }] of attributes) {
                vertexBuffers[location] = buffer
                bufferLayouts[location] = createBufferLayout(location, array.length, count)
        }
        return { vertexBuffers, bufferLayouts }
}
