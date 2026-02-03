import { nested } from 'reev'
import { getStride, is, loadingTexture } from '../helpers'
import { createBuffer, createTextureSampler, updateBuffer } from './utils'
import type { GL } from '../types'

export const graphic = (gl: GL, update = () => {}) => {
        const { count, instanceCount, attributes, instances, uniforms, textures, binding } = gl
        let pipeline: GPURenderPipeline
        let bindGroups: GPUBindGroup[]
        let vertexBuffers: GPUBuffer[]

        const _attributes = nested((key, value: number[], isInstance = false, stride = getStride(value.length, isInstance ? instanceCount : count, gl.error, key)) => {
                update()
                return { ...binding.attrib(key), ...createBuffer(gl.device, value, 'attrib'), isInstance, stride }
        })

        const _uniforms = nested((key, value: number[] | Float32Array) => {
                update()
                return { ...binding.uniform(key), ...createBuffer(gl.device, value, 'uniform') }
        })

        const _textures = nested((key, width = 1, height = 1) => {
                update()
                return { ...binding.texture(key), ...createTextureSampler(gl.device, width, height) }
        })

        gl('_attribute', (key: string, value: number[] | Float32Array) => {
                if (attributes && !(key in attributes)) return
                const a = _attributes(key, value)
                updateBuffer(gl.device, value, a.array, a.buffer)
        })

        gl('_instance', (key: string, value: number[] | Float32Array) => {
                if (instances && !(key in instances)) return
                const a = _attributes(key, value, true)
                updateBuffer(gl.device, value, a.array, a.buffer)
        })

        gl('_uniform', (key: string, value: number | number[] | Float32Array) => {
                if (uniforms && !(key in uniforms)) return
                if (is.num(value)) value = [value]
                const u = _uniforms(key, value)
                updateBuffer(gl.device, value, u.array, u.buffer)
        })

        gl('_texture', (key: string, src: string) => {
                if (textures && !(key in textures)) return
                const t = _textures(key)
                loadingTexture(src, (source, isVideo) => {
                        const [width, height] = isVideo ? [source.videoWidth, source.videoHeight] : [source.width, source.height]
                        t.texture.destroy()
                        Object.assign(t, createTextureSampler(gl.device, width, height))
                        update() // Rebuilding BindGroups because the texture size has changed
                        const render = () => void gl.device.queue.copyExternalImageToTexture({ source }, { texture: t.texture }, { width, height })
                        if (isVideo) gl({ render })
                        else render()
                })
        })

        gl('render', () => {
                if (!pipeline || !bindGroups || !vertexBuffers) return
                gl.passEncoder.setPipeline(pipeline)
                bindGroups.forEach((v, i) => gl.passEncoder.setBindGroup(i, v))
                vertexBuffers.forEach((v, i) => gl.passEncoder.setVertexBuffer(i, v))
                gl.passEncoder.draw(count, instanceCount, 0, 0)
        })

        gl('clean', () => {
                for (const { buffer } of _attributes.map.values()) buffer.destroy()
                for (const { texture } of _textures.map.values()) texture.destroy()
                for (const { buffer } of _uniforms.map.values()) buffer.destroy()
        })

        const set = (_pipeline: GPURenderPipeline, _bindGroups: GPUBindGroup[], _vertexBuffers: GPUBuffer[]) => {
                pipeline = _pipeline
                bindGroups = _bindGroups
                vertexBuffers = _vertexBuffers
        }

        return { _uniforms, _textures, _attributes, set }
}
