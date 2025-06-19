import { X } from '../node'
import { is } from './helpers'
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
        vs: string | X = defaultVertexWGSL,
        fs: string | X = defaultFragmentWGSL
) => {
        if (is.obj(fs)) fs = `${fs}`
        if (is.obj(vs)) vs = `${vs}`
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

export const createBindGroup = (device: GPUDevice, resources: any[]) => {
        const entries0 = [] as any[]
        const entries1 = [] as any[]
        resources.forEach((resource, binding) => {
                if (!resource) return
                const isUniform = 'buffer' in resource // @ts-ignore
                const isTexture = resource instanceof GPUTextureView // @ts-ignore
                const isSampler = resource instanceof GPUSampler // @ts-ignore
                if (isUniform) entries0.push({ binding, visibility: 3, buffer: { type: 'uniform' } })
                else if (isTexture) entries0.push({ binding, visibility: 2, texture: {} })
                else if (isSampler) entries0.push({ binding, visibility: 2, sampler: {} })
                else return
                entries1.push({ binding, resource })
        })
        const layout = device.createBindGroupLayout({ entries: entries0 })
        const bindGroup = device.createBindGroup({ layout, entries: entries1 })
        return { layout, bindGroup }
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

export const alignTo256 = (size: number) => Math.ceil(size / 256) * 256

export const createVertexBuffer = (device: GPUDevice, value: number[]) => {
        const array = new Float32Array(value)
        const buffer = device.createBuffer({ size: array.byteLength, usage: 40 }) // 40 === // GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        return { array, buffer }
}

export const createUniformBuffer = (device: GPUDevice, value: number[]) => {
        const array = new Float32Array(value)
        const size = alignTo256(array.byteLength)
        const buffer = device.createBuffer({ size, usage: 72 }) as Buffer // 72 === GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        return { array, buffer }
}

export const createTextureSampler = (device: GPUDevice, width = 1280, height = 800) => {
        const texture = device.createTexture({ size: [width, height], format: 'rgba8unorm', usage: 22 })
        const sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' })
        return { texture, sampler }
}

const getVertexStride = (dataLength: number, vertexCount: number) => {
        return dataLength / vertexCount
}

const getVertexFormat = (stride: number) => {
        if (stride === 2) return 'float32x2'
        if (stride === 3) return 'float32x3'
        if (stride === 4) return 'float32x4'
        return 'float32'
}

export const createBufferLayout = (shaderLocation: number, dataLength: number, count = 6) => {
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
