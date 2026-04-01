import { nested } from 'reev'
import { alignStride, alignTo256, arrayOffset, arrayStride, bindingGroup, bindingIndex, is, isFloat32 } from '../helpers'
import type { AttribData, TextureData, UniformData, StorageData } from '../types'

type IAttribs = Iterable<AttribData & { isInstance?: boolean }>
type IUniforms = Iterable<UniformData>
type ITextures = Iterable<TextureData>
type IStorages = Iterable<StorageData>

/**
 * binding
 */
export const createBinding = () => {
        let _uniform = 0
        let _texture = 0
        let _storage = 0
        let _attrib = 0
        const uniform = nested(() => {
                const group = bindingGroup(_uniform, 12)
                const binding = bindingIndex(_uniform, 12)
                _uniform++
                return { group, binding }
        })
        const texture = nested(() => {
                const base = bindingGroup(_uniform, 12) + 1
                const group = bindingGroup(_texture, 6, base)
                const binding = bindingIndex(_texture, 6, 2)
                _texture++
                return { group, binding }
        })
        const storage = nested(() => {
                const base = bindingGroup(_uniform, 12) + bindingGroup(_texture, 6) + 2
                const group = bindingGroup(_storage, 12, base)
                const binding = bindingIndex(_storage, 12)
                _storage++
                return { group, binding }
        })
        const attrib = nested(() => ({ location: _attrib++ }))
        return { uniform, texture, storage, attrib }
}

export type Binding = ReturnType<typeof createBinding>

/**
 * initialize
 */
export const createDevice = async (c: GPUCanvasContext, log = console.log, signal?: AbortSignal) => {
        const gpu = navigator.gpu
        const format = gpu.getPreferredCanvasFormat()
        const adapter = await gpu.requestAdapter()
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
        const device = await adapter!.requestDevice()
        if (signal?.aborted) {
                device.destroy()
                if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
        }
        device.onuncapturederror = (e) => log(e.error.message)
        c.configure({ device, format, alphaMode: 'premultiplied' })
        return { device, format }
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

const createVertexBuffers = (attribs: IAttribs, error = console.warn) => {
        const vertexBuffers: GPUBuffer[] = []
        const bufferLayouts: GPUVertexBufferLayout[] = []
        for (const { buffer, location, stride, isInstance } of attribs) {
                vertexBuffers[location] = buffer
                const arrayStride = alignStride(stride, error)
                bufferLayouts[location] = {
                        arrayStride,
                        stepMode: isInstance ? 'instance' : 'vertex',
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

const createBindGroup = (device: GPUDevice, uniforms: IUniforms, textures: ITextures, storages: IStorages = []) => {
        const groups = new Map<number, { layouts: GPUBindGroupLayoutEntry[]; bindings: GPUBindGroupEntry[] }>()
        const ret = { bindGroups: [] as GPUBindGroup[], bindGroupLayouts: [] as GPUBindGroupLayout[] }
        const add = (i: number, layout: GPUBindGroupLayoutEntry, binding: GPUBindGroupEntry) => {
                if (!groups.has(i)) groups.set(i, { layouts: [], bindings: [] })
                const { layouts, bindings } = groups.get(i)!
                layouts.push(layout)
                bindings.push(binding)
        }
        for (const { binding, buffer, group } of uniforms) {
                add(group, { binding, visibility: 7, buffer: { type: 'uniform' } }, { binding, resource: { buffer } })
        }
        for (const { binding, buffer, group } of storages) {
                add(group, { binding, visibility: 6, buffer: { type: 'storage' } }, { binding, resource: { buffer } })
        }
        for (const { binding: b, group, sampler, view, isArray } of textures) {
                add(group, { binding: b, visibility: 2, sampler: {} }, { binding: b, resource: sampler })
                const dim: GPUTextureBindingLayout = isArray ? { viewDimension: '2d-array' } : {}
                add(group, { binding: b + 1, visibility: 2, texture: dim }, { binding: b + 1, resource: view })
        }
        for (const [i, { layouts, bindings }] of groups) {
                ret.bindGroupLayouts[i] = device.createBindGroupLayout({ entries: layouts })
                ret.bindGroups[i] = device.createBindGroup({ layout: ret.bindGroupLayouts[i], entries: bindings })
        }
        return ret
}

const createPipeline = (device: GPUDevice, format: GPUTextureFormat, bufferLayouts: GPUVertexBufferLayout[], bindGroupLayouts: GPUBindGroupLayout[], vs: string, fs: string, isDepth: boolean) => {
        const config: GPURenderPipelineDescriptor = {
                primitive: { topology: 'triangle-list' },
                layout: device.createPipelineLayout({ bindGroupLayouts }),
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
        }
        if (isDepth) config.depthStencil = { depthWriteEnabled: true, depthCompare: 'less', format: 'depth24plus' }
        return device.createRenderPipeline(config)
}

const createComputePipeline = (device: GPUDevice, bindGroupLayouts: GPUBindGroupLayout[], cs: string) => {
        if (!cs) return
        return device.createComputePipeline({
                compute: {
                        module: device.createShaderModule({ label: 'compute', code: cs.trim() }),
                        entryPoint: 'main',
                },
                layout: device.createPipelineLayout({ bindGroupLayouts }),
        })
}

export const updatePipeline = (device: GPUDevice, format: GPUTextureFormat, attribs: IAttribs, uniforms: IUniforms, textures: ITextures, storages: IStorages, fs: string, cs: string, vs: string, isDepth: boolean, error = console.warn) => {
        const { vertexBuffers, bufferLayouts } = createVertexBuffers(attribs, error)
        const { bindGroups, bindGroupLayouts } = createBindGroup(device, uniforms, textures, storages)
        const computePipeline = createComputePipeline(device, bindGroupLayouts, cs)
        const graphicPipeline = createPipeline(device, format, bufferLayouts, bindGroupLayouts, vs, fs, isDepth)
        return { bindGroups, vertexBuffers, computePipeline, graphicPipeline }
}

/**
 * buffers
 */
const bufferUsage = (type: 'uniform' | 'storage' | 'attrib') => {
        if (type === 'uniform') return 72 // 72 is GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        if (type === 'attrib') return 40 // 40 is GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        return 140 // 140 is GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
}

export const createBuffer = (device: GPUDevice, array: number[] | Float32Array, type: 'uniform' | 'storage' | 'attrib') => {
        if (!isFloat32(array)) array = new Float32Array(array)
        const usage = bufferUsage(type)
        const size = type === 'uniform' ? alignTo256(array.byteLength) : array.byteLength
        const buffer = device.createBuffer({ size, usage })
        return { array, buffer }
}

export const updateBuffer = (device: GPUDevice, value: number[] | Float32Array, array: Float32Array, buffer: GPUBuffer) => {
        array.set(value as Float32Array)
        device.queue.writeBuffer(buffer, 0, array as GPUAllowSharedBufferSource)
}

export const createUniformArray = (device: GPUDevice, value: number[] | Float32Array) => {
        if (!isFloat32(value)) value = new Float32Array(value)
        const size = alignTo256((value as Float32Array).byteLength)
        const buffer = device.createBuffer({ size, usage: 72 })
        const array = new Float32Array(size / 4)
        array.set(value as Float32Array)
        return { array, buffer }
}

export const updateUniformArray = (device: GPUDevice, value: number[] | Float32Array, array: Float32Array, buffer: GPUBuffer, at: number, error = console.warn) => {
        const offset = arrayOffset(value.length, at)
        const stride = arrayStride(value.length, error)
        for (let i = 0; i < value.length; i++) array[offset + i] = value[i]
        device.queue.writeBuffer(buffer, offset * 4, array as GPUAllowSharedBufferSource, offset, stride)
}

export const createDescriptor = (c: GPUCanvasContext, depthTexture?: GPUTexture) => {
        const ret: GPURenderPassDescriptor = { colorAttachments: [{ view: c.getCurrentTexture().createView(), clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'store' }] }
        if (depthTexture) ret.depthStencilAttachment = { view: depthTexture.createView(), depthClearValue: 1.0, depthLoadOp: 'clear', depthStoreOp: 'store' }
        return ret
}

/**
 * textures
 */
export const createTextureSampler = (device: GPUDevice, width = 1280, height = 800, isArray = false, layers = 16) => {
        const size: GPUExtent3DStrict = isArray ? [width, height, layers] : [width, height]
        const filter: GPUFilterMode = isArray ? 'nearest' : 'linear'
        const texture = device.createTexture({ size, format: 'rgba8unorm', usage: 22, dimension: '2d' }) // 22 is GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        // const usage = isArray ? 6 : 22 // 6 is TEXTURE_BINDING | COPY_DST, 22 adds RENDER_ATTACHMENT
        // const texture = device.createTexture({ size, format: 'rgba8unorm', usage, dimension: '2d' })
        const sampler = device.createSampler({ magFilter: filter, minFilter: filter })
        const view = texture.createView(isArray ? { dimension: '2d-array' } : undefined)
        return { texture, sampler, view, isArray }
}

export const createDepthTexture = (device: GPUDevice, width: number, height: number) => {
        return device.createTexture({ size: [width, height], format: 'depth24plus', usage: 16 }) // 16 is GPUTextureUsage.RENDER_ATTACHMENT
}

/**
 * utils
 */
export const workgroupCount = (particleCount: number | number[], workgroupSize = 32) => {
        if (is.num(particleCount)) particleCount = [particleCount]
        const [x, y = 1, z = 1] = particleCount
        return {
                x: Math.min((x * y * z) / workgroupSize, 65535),
                y: 1,
                z: 1,
        }
}
