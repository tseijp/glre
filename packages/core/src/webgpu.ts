import { nested as cached } from 'reev'
import { is, loadingImage } from './utils/helpers'
import {
        createArrayBuffer,
        createBindGroup,
        createBindings,
        createComputePipeline,
        createDepthTexture,
        createDescriptor,
        createDevice,
        createPipeline,
        createTextureSampler,
        createVertexBuffers,
} from './utils/pipeline'
import type { GL, WebGPUState } from './types'
import { compute, fragment, vertex } from './node'

const WORKING_GROUP_SIZE = 32

const computeProgram = (gl: GL, device: GPUDevice, bindings: any) => {
        let flush = (_pass: GPUComputePassEncoder) => {}

        const storages = cached((_key, value: number[] | Float32Array) => {
                const { array, buffer } = createArrayBuffer(device, value, 'storage')
                const { binding, group } = bindings.storage()
                return { array, buffer, binding, group }
        })

        const _storage = (key: string, value: number[] | Float32Array) => {
                const { array, buffer } = storages(key, value)
                device.queue.writeBuffer(buffer, 0, array as any)
        }

        const update = (bindGroups: GPUBindGroup[], bindGroupLayouts: GPUBindGroupLayout[], comp: string) => {
                const pipeline = createComputePipeline(device, bindGroupLayouts, comp!)
                flush = (pass) => {
                        pass.setPipeline(pipeline)
                        bindGroups.forEach((v, i) => pass.setBindGroup(i, v))
                        const workgroupCount = Math.ceil(gl.particles / WORKING_GROUP_SIZE)
                        pass.dispatchWorkgroups(workgroupCount, 1, 1)
                        pass.end()
                }
        }

        const render = (pass: GPUComputePassEncoder) => {
                flush(pass)
        }

        const clean = () => {
                for (const { buffer } of storages.map.values()) buffer.destroy()
        }

        return { storages, _storage, update, render, clean }
}

export const webgpu = async (gl: GL) => {
        const context = gl.el!.getContext('webgpu') as GPUCanvasContext
        const { device, format } = await createDevice(context, gl.error)
        const bindings = createBindings()
        const cp = computeProgram(gl, device, bindings)
        let frag: string
        let comp: string
        let vert: string
        let flush = (_pass: GPURenderPassEncoder) => {}
        let needsUpdate = true
        let depthTexture: GPUTexture

        const attribs = cached((_key, value: number[]) => {
                needsUpdate = true
                const stride = value.length / gl.count
                const { location } = bindings.attrib()
                const { array, buffer } = createArrayBuffer(device, value, 'attrib')
                return { array, buffer, location, stride }
        })

        const uniforms = cached((_key, value: number[]) => {
                needsUpdate = true
                const { binding, group } = bindings.uniform()
                const { array, buffer } = createArrayBuffer(device, value, 'uniform')
                return { array, buffer, binding, group }
        })

        const textures = cached((_key, width = 0, height = 0) => {
                needsUpdate = true
                const { binding, group } = bindings.texture()
                const { texture, sampler } = createTextureSampler(device, width, height)
                return { texture, sampler, binding, group, view: texture.createView() }
        })

        const _attribute = (key = '', value: number[]) => {
                const { array, buffer } = attribs(key, value)
                device.queue.writeBuffer(buffer, 0, array as any)
        }

        const _uniform = (key: string, value: number | number[]) => {
                if (is.num(value)) value = [value]
                const { array, buffer } = uniforms(key, value)
                array.set(value) // needs to set leatest value
                device.queue.writeBuffer(buffer, 0, array as any)
        }

        const _texture = (key: string, src: string) => {
                loadingImage(gl, src, (source) => {
                        const { width, height } = source
                        const { texture } = textures(key, width, height)
                        device.queue.copyExternalImageToTexture({ source }, { texture }, { width, height })
                })
        }

        const update = () => {
                const { vertexBuffers, bufferLayouts } = createVertexBuffers(attribs.map.values())
                const { bindGroups, bindGroupLayouts } = createBindGroup(
                        device,
                        uniforms.map.values(),
                        textures.map.values(),
                        cp.storages.map.values()
                )
                const pipeline = createPipeline(device, format, bufferLayouts, bindGroupLayouts, vert, frag)
                flush = (pass) => {
                        pass.setPipeline(pipeline)
                        bindGroups.forEach((v, i) => pass.setBindGroup(i, v))
                        vertexBuffers.forEach((v, i) => pass.setVertexBuffer(i, v))
                        pass.draw(gl.count, 1, 0, 0)
                        pass.end()
                }
                if (gl.cs) cp.update(bindGroups, bindGroupLayouts, comp)
        }

        const render = () => {
                if (!frag || !vert) {
                        const config = { isWebGL: false, gl }
                        frag = fragment(gl.fs, config) // needs to be before vertex
                        vert = vertex(gl.vs, config)
                        comp = compute(gl.cs, config)
                }
                if (gl.loading) return // MEMO: loading after build node
                if (needsUpdate) update()
                needsUpdate = false
                const encoder = device.createCommandEncoder()
                if (gl.cs) cp.render(encoder.beginComputePass())
                flush(encoder.beginRenderPass(createDescriptor(context, depthTexture)))
                device.queue.submit([encoder.finish()])
        }

        const resize = () => {
                const canvas = gl.el as HTMLCanvasElement
                depthTexture?.destroy()
                depthTexture = createDepthTexture(device, canvas.width, canvas.height)
        }

        const clean = () => {
                device.destroy()
                depthTexture?.destroy()
                for (const { texture } of textures.map.values()) texture.destroy()
                for (const { buffer } of uniforms.map.values()) buffer.destroy()
                for (const { buffer } of attribs.map.values()) buffer.destroy()
                cp.clean()
        }

        resize()

        const webgpu = { device, uniforms, textures, attribs, storages: cp.storages } as WebGPUState

        return { webgpu, render, resize, clean, _attribute, _uniform, _texture, _storage: cp._storage }
}
