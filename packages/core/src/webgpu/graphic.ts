import { nested as cached } from 'reev'
import { is, getStride, loadingTexture } from '../helpers'
import { createArrayBuffer, createDepthTexture, createDescriptor, createTextureSampler } from './utils'
import type { Binding } from './utils'
import type { GL } from '../types'

export const graphic = (gl: GL, bindings: Binding, setUpdate = () => {}) => {
        let pipeline: GPURenderPipeline
        let bindGroups: GPUBindGroup[]
        let vertexBuffers: GPUBuffer[]
        let depthTexture: GPUTexture

        const attribs = cached((key, value: number[], isInstance = false) => {
                setUpdate()
                const stride = getStride(value.length, isInstance ? gl.instanceCount : gl.count)
                return { stride, ...bindings.attrib(key), ...createArrayBuffer(gl.device, value, 'attrib'), isInstance }
        })

        const uniforms = cached((key, value: number[]) => {
                setUpdate()
                return { ...bindings.uniform(key), ...createArrayBuffer(gl.device, value, 'uniform') }
        })

        const textures = cached((key, width = 0, height = 0) => {
                setUpdate()
                const { texture, sampler } = createTextureSampler(gl.device, width, height)
                return { texture, sampler, ...bindings.texture(key), view: texture.createView() }
        })

        gl('_attribute', (key = '', value: number[]) => {
                const { array, buffer } = attribs(key, value)
                array.set(value)
                gl.device.queue.writeBuffer(buffer, 0, array as any)
        })

        gl('_instance', (key: string, value: number[]) => {
                const { array, buffer } = attribs(key, value, true)
                array.set(value)
                gl.device.queue.writeBuffer(buffer, 0, array as any)
        })

        gl('_uniform', (key: string, value: number | number[]) => {
                if (is.num(value)) value = [value]
                const { array, buffer } = uniforms(key, value)
                array.set(value)
                gl.device.queue.writeBuffer(buffer, 0, array as any)
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
                const pass = gl.encoder.beginRenderPass(createDescriptor(gl.context, depthTexture))
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
                for (const { texture } of textures.map.values()) texture.destroy()
                for (const { buffer } of uniforms.map.values()) buffer.destroy()
                for (const { buffer } of attribs.map.values()) buffer.destroy()
        })

        const set = (_pipeline: GPURenderPipeline, _bindGroups: GPUBindGroup[], _vertexBuffers: GPUBuffer[]) => {
                pipeline = _pipeline
                bindGroups = _bindGroups
                vertexBuffers = _vertexBuffers
        }

        return { uniforms, textures, attribs, set }
}
