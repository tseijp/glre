import { GPUContext, GPUDevice, GPUPipeline } from '../types'

const defaultVertexWGSL = `
@vertex
fn main(@builtin(vertex_index) vertex_index: u32) -> @builtin(position) vec4f {
  let x = f32(vertex_index % 2u) * 4.0 - 1.0;
  let y = f32(vertex_index / 2u) * 4.0 - 1.0;
  return vec4f(x, y, 0.0, 1.0);
}
`

// const defaultFragmentWGSL = `
// struct Uniforms {
//   iResolution: vec2f,
//   iMouse: vec2f,
//   iTime: f32,
// }
//
// @group(0) @binding(0) var<uniform> u: Uniforms;
//
// @fragment
// fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
//   return vec4f(position.xy / u.iResolution, 0.0, 1.0);
// }
// `

const defaultFragmentWGSL = `
@group(0) @binding(0) var<uniform> iResolution: vec2f;
@group(0) @binding(1) var<uniform> iMouse: vec2f;
@group(0) @binding(2) var<uniform> iTime: f32;

@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
  return vec4f(position.xy / iResolution, 0.0, 1.0);
}
`

export const createPipeline = (
        device: GPUDevice,
        format: string,
        vs = defaultVertexWGSL,
        fs = defaultFragmentWGSL,
        buffers: any[],
        layout: any = 'auto'
) => {
        return device.createRenderPipeline({
                vertex: {
                        module: device.createShaderModule({ code: vs.trim() }),
                        entryPoint: 'main',
                        buffers,
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

// export const alignTo256 = (size: number) => Math.ceil(size / 256) * 256
//
// export const createUniformBuffer = (device: GPUDevice, size: number) => {
//         return device.createBuffer({ size: alignTo256(size), usage: 0x40 | 0x4 }) as Buffer
// }
//
// export const createVertexBuffer = (device: GPUDevice, value: number[]) => {
//         const array = new Float32Array(value)
//         const buffer = device.createBuffer({ size: array.byteLength, usage: 0x20 | 0x4 })
//         device.queue.writeBuffer(buffer, 0, array)
//         return buffer as Buffer
// }
//
// export const createBindGroup = (device: GPUDevice, pipeline: GPUPipeline, entries: any[]) => {
//         const layout = pipeline.getBindGroupLayout(0)
//         return device.createBindGroup({ layout, entries })
// }
//
// export const updateBindGroup = (
//         device: GPUDevice,
//         pipeline: GPUPipeline,
//         uniformBuffer: Buffer,
//         textures: any = {},
//         sampler: any = null
// ) => {
//         const entries = [{ binding: 0, resource: { buffer: uniformBuffer } }]
//         let binding = 1
//         Object.values(textures).forEach((texture: any) => {
//                 entries.push({ binding: binding++, resource: texture.createView() })
//         })
//         if (sampler && Object.keys(textures).length > 0) entries.push({ binding: binding++, resource: sampler })
//         return createBindGroup(device, pipeline, entries)
// }
//
// export const createUniform = (device: GPUDevice, buffer: any, data: Float32Array, offset = 0) => {
//         device.queue.writeBuffer(buffer, offset, data)
// }
//
// export const createDeviceTexture = (device: GPUDevice, image: HTMLImageElement) => {
//         const texture = device.createTexture({
//                 size: { width: image.width, height: image.height },
//                 format: 'rgba8unorm',
//                 usage: 0x4 | 0x2,
//         })
//         device.queue.copyExternalImageToTexture(
//                 { source: image },
//                 { texture },
//                 { width: image.width, height: image.height }
//         )
//         return texture
// }
//
// export const createSampler = (device: GPUDevice) => {
//         return device.createSampler({
//                 magFilter: 'linear',
//                 minFilter: 'linear',
//                 addressModeU: 'clamp-to-edge',
//                 addressModeV: 'clamp-to-edge',
//         })
// }
//
// export const getDefaultVertices = () => new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
