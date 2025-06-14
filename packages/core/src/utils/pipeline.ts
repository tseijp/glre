import { GPUContext, GPUDevice, GPUPipeline } from '../types'

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

export const createPipeline = (
        device: GPUDevice,
        format: string,
        vs = defaultVertexWGSL,
        fs = defaultFragmentWGSL,
        buffers: any[],
        layouts: any[]
) => {
        const layout = device.createPipelineLayout({ bindGroupLayouts: layouts })
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

export const alignTo256 = (size: number) => Math.ceil(size / 256) * 256

export const createUniformBuffer = (device: GPUDevice, value: number[]) => {
        const array = new Float32Array(value)
        const size = alignTo256(array.byteLength)
        const buffer = device.createBuffer({ size, usage: 72 }) as Buffer // 72 === GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        return { array, buffer }
}

//
// export const createVertexBuffer = (device: GPUDevice, value: number[]) => {
//         const array = new Float32Array(value)
//         const buffer = device.createBuffer({ size: array.byteLength, usage: 0x20 | 0x4 })
//         device.queue.writeBuffer(buffer, 0, array)
//         return buffer as Buffer
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
