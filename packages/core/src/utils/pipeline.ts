import { is, isFloat32 } from './helpers'
import type { AttribData, TextureData, UniformData, StorageData } from '../types'

/**
 * initialize
 */
export const createDevice = async (c: GPUCanvasContext, log = console.log) => {
        const gpu = navigator.gpu
        const format = gpu.getPreferredCanvasFormat()
        const adapter = await gpu.requestAdapter()
        const device = await adapter!.requestDevice()
        device.onuncapturederror = (e) => log(e.error.message)
        c.configure({ device, format, alphaMode: 'opaque' })
        return { device, format }
}

export const createBindings = () => {
        let uniform = 0
        let texture = 0
        let storage = 0
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
                storage: () => {
                        const baseGroup = Math.floor(uniform / 12) + Math.floor(texture / 6) + 2
                        const group = baseGroup + Math.floor(storage / 12)
                        const binding = storage % 12
                        storage++
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

export const createVertexBuffers = (attribs: Iterable<AttribData & { isInstance?: boolean }>) => {
        const vertexBuffers: GPUBuffer[] = []
        const bufferLayouts: GPUVertexBufferLayout[] = []
        for (const { buffer, location, stride, isInstance } of attribs) {
                vertexBuffers[location] = buffer
                const componentSize = Math.min(Math.max(Math.floor(stride), 1), 4)
                const arrayStride = Math.max(4, Math.ceil((componentSize * 4) / 4) * 4)
                bufferLayouts[location] = {
                        arrayStride,
                        stepMode: isInstance ? 'instance' : 'vertex',
                        attributes: [
                                {
                                        shaderLocation: location,
                                        offset: 0,
                                        format: getVertexFormat(componentSize),
                                },
                        ],
                }
        }
        return { vertexBuffers, bufferLayouts }
}

export const createBindGroup = (
        device: GPUDevice,
        uniforms: Iterable<UniformData>,
        textures: Iterable<TextureData>,
        storages: Iterable<StorageData> = []
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
                add(i, { binding, visibility: 7, buffer: { type: 'uniform' } }, { binding, resource: { buffer } })
        }
        for (const { binding, buffer, group: i } of storages) {
                add(i, { binding, visibility: 6, buffer: { type: 'storage' } }, { binding, resource: { buffer } })
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
                        module: device.createShaderModule({ label: 'vert', code: vs.trim() }),
                        entryPoint: 'main',
                        buffers: bufferLayouts,
                },
                fragment: {
                        module: device.createShaderModule({ label: 'frag', code: fs.trim() }),
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

export const createComputePipeline = (device: GPUDevice, bindGroupLayouts: GPUBindGroupLayout[], cs: string) => {
        return device.createComputePipeline({
                compute: {
                        module: device.createShaderModule({ label: 'compute', code: cs.trim() }),
                        entryPoint: 'main',
                },
                layout: device.createPipelineLayout({ bindGroupLayouts }),
        })
}

/**
 * buffers
 */
const bufferUsage = (type: 'uniform' | 'storage' | 'attrib') => {
        if (type === 'uniform') return 72 // GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        if (type === 'attrib') return 40 // GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        return 140 // GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
}

export const createArrayBuffer = (
        device: GPUDevice,
        array: number[] | Float32Array,
        type: 'uniform' | 'storage' | 'attrib'
) => {
        if (!isFloat32(array)) array = new Float32Array(array)
        const usage = bufferUsage(type)
        const size = type === 'uniform' ? Math.ceil(array.byteLength / 256) * 256 : array.byteLength
        const buffer = device.createBuffer({ size, usage })
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

/**
 * utils
 */
export const workgroupCount = (particles: number | number[], workgroupSize = 32) => {
        if (is.num(particles)) particles = [particles]
        const [x, y = 1, z = 1] = particles
        return {
                x: Math.min((x * y * z) / workgroupSize, 65535),
                y: 1,
                z: 1,
        }
}
