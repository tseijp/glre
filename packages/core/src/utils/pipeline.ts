import type { AttribData, TextureData, UniformData } from '../types'

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

/**
 * pipeline update
 */
const getVertexFormat = (stride: number): GPUVertexFormat => {
        if (stride === 2) return 'float32x2'
        if (stride === 3) return 'float32x3'
        if (stride === 4) return 'float32x4'
        return 'float32'
}

export const createVertexBuffers = (attribs: Iterable<AttribData>) => {
        const vertexBuffers: GPUBuffer[] = []
        const bufferLayouts: GPUVertexBufferLayout[] = []
        for (const { buffer, location, stride } of attribs) {
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

export const createBindGroup = (
        device: GPUDevice,
        uniforms: Iterable<UniformData>,
        textures: Iterable<TextureData>
) => {
        const groups = new Map<number, { layouts: GPUBindGroupLayoutEntry[]; bindings: GPUBindGroupEntry[] }>()
        const ret = { bindGroups: [] as GPUBindGroup[], bindGroupLayouts: [] as GPUBindGroupLayout[] }
        const add = (i: number, layout: GPUBindGroupLayoutEntry, binding: GPUBindGroupEntry) => {
                if (!groups.has(i)) groups.set(i, { layouts: [], bindings: [] })
                const { layouts, bindings } = groups.get(i)!
                layouts.push(layout)
                bindings.push(binding)
        }
        for (const { binding, buffer, group: i } of uniforms) {
                add(i, { binding, visibility: 3, buffer: { type: 'uniform' } }, { binding, resource: { buffer } })
        }
        for (const { binding: b, group: i, sampler, view } of textures) {
                add(i, { binding: b, visibility: 2, sampler: {} }, { binding: b, resource: sampler })
                add(i, { binding: b + 1, visibility: 2, texture: {} }, { binding: b + 1, resource: view })
        }
        for (const [i, { layouts, bindings }] of groups) {
                ret.bindGroupLayouts[i] = device.createBindGroupLayout({ entries: layouts })
                ret.bindGroups[i] = device.createBindGroup({ layout: ret.bindGroupLayouts[i], entries: bindings })
        }
        return ret
}

export const createPipeline = (
        device: GPUDevice,
        format: GPUTextureFormat,
        bufferLayouts: GPUVertexBufferLayout[],
        bindGroupLayouts: GPUBindGroupLayout[],
        vs: string,
        fs: string
) => {
        return device.createRenderPipeline({
                vertex: {
                        module: device.createShaderModule({ label: 'vert', code: vs }),
                        entryPoint: 'main',
                        buffers: bufferLayouts,
                },
                fragment: {
                        module: device.createShaderModule({ label: 'frag', code: fs }),
                        entryPoint: 'main',
                        targets: [{ format }],
                },
                layout: device.createPipelineLayout({ bindGroupLayouts }),
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

/**
 * textures
 */
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
