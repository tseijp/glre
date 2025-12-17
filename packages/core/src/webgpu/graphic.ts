import { nested } from 'reev'
import { is, getStride, loadingTexture } from '../helpers'
import { createBuffer, createDepthTexture, createDescriptor, createTextureSampler, updateBuffer } from './utils'
import type { Binding } from './utils'
import type { GL } from '../types'

export const graphic = (gl: GL, bindings: Binding, update = () => {}) => {
        let pipeline: GPURenderPipeline
        let bindGroups: GPUBindGroup[]
        let vertexBuffers: GPUBuffer[]
        let depthTexture: GPUTexture

        const attributes = nested((key, value: number[], isInstance = false, stride = getStride(value.length, isInstance ? gl.instanceCount : gl.count)) => {
                update()
                return { isInstance, stride, ...bindings.attrib(key), ...createBuffer(gl.device, value, 'attrib') }
        })

        const uniforms = nested((key, value: number[] | Float32Array) => {
                update()
                return { ...bindings.uniform(key), ...createBuffer(gl.device, value, 'uniform') }
        })

        const textures = nested((key, width = 0, height = 0) => {
                update()
                const { texture, sampler } = createTextureSampler(gl.device, width, height)
                return { texture, sampler, ...bindings.texture(key), view: texture.createView() }
        })

        gl('_attribute', (key: string, value: number[] | Float32Array) => {
                const a = attributes(key, value)
                updateBuffer(gl.device, value, a.array, a.buffer)
        })

        gl('_instance', (key: string, value: number[] | Float32Array) => {
                const a = attributes(key, value, true)
                updateBuffer(gl.device, value, a.array, a.buffer)
        })

        gl('_uniform', (key: string, value: number | number[] | Float32Array) => {
                if (is.num(value)) value = [value]
                const u = uniforms(key, value)
                updateBuffer(gl.device, value, u.array, u.buffer)
        })

        gl('_texture', (key: string, src: string) => {
                gl.loading++
                loadingTexture(src, (source, isVideo) => {
                        const [width, height] = isVideo ? [source.videoWidth, source.videoHeight] : [source.width, source.height]
                        const { texture } = textures(key, width, height)
                        const render = () => void gl.device.queue.copyExternalImageToTexture({ source }, { texture }, { width, height })
                        render()
                        if (isVideo) gl({ render })
                        gl.loading--
                })
        })

        gl('render', () => {
                if (!pipeline || !bindGroups || !vertexBuffers) return
                const pass = gl.encoder.beginRenderPass(createDescriptor(gl.gpu, depthTexture))
                pass.setPipeline(pipeline)
                bindGroups.forEach((v, i) => pass.setBindGroup(i, v))
                vertexBuffers.forEach((v, i) => pass.setVertexBuffer(i, v))
                pass.draw(gl.count, gl.instanceCount, 0, 0)
                pass.end()
        })

        gl('resize', () => {
                const canvas = gl.el as HTMLCanvasElement
                depthTexture?.destroy()
                depthTexture = createDepthTexture(gl.device, canvas.width, canvas.height)
        })

        gl('clean', () => {
                depthTexture?.destroy()
                for (const { buffer } of attributes.map.values()) buffer.destroy()
                for (const { texture } of textures.map.values()) texture.destroy()
                for (const { buffer } of uniforms.map.values()) buffer.destroy()
        })

        const set = (_pipeline: GPURenderPipeline, _bindGroups: GPUBindGroup[], _vertexBuffers: GPUBuffer[]) => {
                pipeline = _pipeline
                bindGroups = _bindGroups
                vertexBuffers = _vertexBuffers
        }

        return { uniforms, textures, attributes, set }
}
