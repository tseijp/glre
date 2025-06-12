type Device = any
type Buffer = any
type Context = any
type Pipeline = any

export const initWebGPUDevice = async (el: HTMLCanvasElement) => {
        const gpu = (navigator as any).gpu
        if (!gpu) return null
        const adapter = await gpu.requestAdapter()
        if (!adapter) return null
        const device = await adapter.requestDevice()
        const context = el.getContext('webgpu') as Context
        if (!context) return null
        const format = gpu.getPreferredCanvasFormat()
        context.configure({ device, format })
        return { device, context, format }
}

const defaultVertexWGSL = `
@vertex
fn vs_main(@location(0) position: vec4f) -> @builtin(position) vec4f {
  return position;
}
`

const defaultFragmentWGSL = `
@group(0) @binding(0) var<uniform> iResolution: vec2f;

@fragment
fn fs_main(@builtin(position) coord: vec4f) -> @location(0) vec4f {
  let uv = fract(coord.xy / iResolution);
  return vec4f(uv, 0.0, 1.0);
}
`

export const createRenderPipeline = (
        device: Device,
        vs = defaultVertexWGSL,
        fs = defaultFragmentWGSL,
        format: string
) => {
        const vertexModule = device.createShaderModule({ code: vs })
        const fragmentModule = device.createShaderModule({ code: fs })
        return device.createRenderPipeline({
                layout: 'auto',
                vertex: { module: vertexModule, entryPoint: 'vs_main' },
                fragment: { module: fragmentModule, entryPoint: 'fs_main', targets: [{ format }] },
                primitive: { topology: 'triangle-list' },
        }) as Pipeline
}

export const alignTo256 = (size: number) => Math.ceil(size / 256) * 256

export const createUniformBuffer = (device: Device, size: number) => {
        return device.createBuffer({ size: alignTo256(size), usage: 0x40 | 0x4 }) as Buffer
}

export const createVertexBuffer = (device: Device, value: number[]) => {
        const array = new Float32Array(value)
        const buffer = device.createBuffer({ size: array.byteLength, usage: 0x20 | 0x4 })
        device.queue.writeBuffer(buffer, 0, array)
        return buffer as Buffer
}

export const createBindGroup = (device: Device, pipeline: Pipeline, entries: any[]) => {
        return device.createBindGroup({
                layout: pipeline.getBindGroupLayout(0),
                entries,
        })
}

export const updateBindGroup = (device: Device, pipeline: Pipeline, uniformBuffer: Buffer, textures: any = {}, sampler: any = null) => {
        const entries = [{ binding: 0, resource: { buffer: uniformBuffer } }]
        
        let binding = 1
        Object.values(textures).forEach((texture: any) => {
                entries.push({ binding: binding++, resource: texture.createView() })
        })
        
        if (sampler && Object.keys(textures).length > 0) {
                entries.push({ binding: binding++, resource: sampler })
        }
        
        return createBindGroup(device, pipeline, entries)
}

export const updateUniform = (device: Device, buffer: any, data: Float32Array, offset = 0) => {
        device.queue.writeBuffer(buffer, offset, data)
}

export const createTexture = (device: Device, image: HTMLImageElement) => {
        const texture = device.createTexture({
                size: { width: image.width, height: image.height },
                format: 'rgba8unorm',
                usage: 0x4 | 0x2,
        })
        device.queue.copyExternalImageToTexture(
                { source: image },
                { texture },
                { width: image.width, height: image.height }
        )
        return texture
}

export const createSampler = (device: Device) => {
        return device.createSampler({
                magFilter: 'linear',
                minFilter: 'linear',
                addressModeU: 'clamp-to-edge',
                addressModeV: 'clamp-to-edge',
        })
}

export const getDefaultVertices = () => new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
