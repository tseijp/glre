import { nested } from 'reev'
import { createArrayBuffer, createBindGroup, createBindings, createPipeline, createTextureSampler, createVertexBuffers } from './utils'
import { getStride, is, loadingTexture, WGSL_FS, WGSL_VS } from '../helpers'
import type { GL } from '../types'

export const graphic = (gl: GL, props: Partial<GL>, device: GPUDevice, format: GPUTextureFormat) => {
        let frag = ''
        let vert = ''
        let comp = ''
        let needsUpdate = true
        let draw = (_pass: GPURenderPassEncoder) => {}
        const b = createBindings()

        const attribs = nested((_key, value: number[], isInstance = false) => {
                needsUpdate = true
                const stride = getStride(value.length, isInstance ? gl.instanceCount : gl.count)
                const { location } = b.attrib()
                const { array, buffer } = createArrayBuffer(device, value, 'attrib')
                return { array, buffer, location, stride, isInstance }
        })
        const uniforms = nested((_key, value: number[]) => {
                needsUpdate = true
                const { binding, group } = b.uniform()
                const { array, buffer } = createArrayBuffer(device, value, 'uniform')
                return { array, buffer, binding, group }
        })
        const textures = nested((_key, width = 0, height = 0) => {
                needsUpdate = true
                const { binding, group } = b.texture()
                const { texture, sampler } = createTextureSampler(device, width, height)
                return { texture, sampler, binding, group, view: texture.createView() }
        })
        const _attribute = (key = '', value: number[]) => {
                const { array, buffer } = attribs(key, value)
                array.set(value)
                device.queue.writeBuffer(buffer, 0, array as any)
        }
        const _instance = (key: string, value: number[]) => {
                const { array, buffer } = attribs(key, value, true)
                array.set(value)
                device.queue.writeBuffer(buffer, 0, array as any)
        }
        const _uniform = (key: string, value: number | number[]) => {
                if (is.num(value)) value = [value]
                const { array, buffer } = uniforms(key, value)
                array.set(value)
                device.queue.writeBuffer(buffer, 0, array as any)
        }
        const _texture = (key: string, src: string) => {
                gl.loading++
                loadingTexture(src, (source, isVideo) => {
                        const [width, height] = isVideo ? [source.videoWidth, source.videoHeight] : [source.width, source.height]
                        const { texture } = textures(key, width, height)
                        const fun = () => device.queue.copyExternalImageToTexture({ source }, { texture }, { width, height })
                        fun()
                        if (isVideo) gl({ render: fun })
                        gl.loading--
                })
        }
        const ensureShaders = () => {
                if (frag && vert) return
                const cfg = { isWebGL: false, gl }
                const f = (props.fs || (props as any).frag || (props as any).fragment) as any
                const v = (props.vs || (props as any).vert || (props as any).vertex) as any
                frag = f ? (is.str(f) ? f : f.fragment(cfg)) : WGSL_FS
                vert = v ? (is.str(v) ? v : v.vertex(cfg)) : WGSL_VS
                comp = gl.cs ? (is.str(gl.cs) ? gl.cs : gl.cs.compute(cfg)) : ''
        }
        const update = () => {
                const { vertexBuffers, bufferLayouts } = createVertexBuffers(attribs.map.values())
                const { bindGroups, bindGroupLayouts } = createBindGroup(device, uniforms.map.values(), textures.map.values(), cp.storages.map.values())
                const pipeline = createPipeline(device, format, bufferLayouts, bindGroupLayouts, vert, frag)
                draw = (pass) => {
                        pass.setPipeline(pipeline)
                        bindGroups.forEach((v, i) => pass.setBindGroup(i, v))
                        vertexBuffers.forEach((v, i) => pass.setVertexBuffer(i, v))
                        pass.draw(gl.count, gl.instanceCount, 0, 0)
                }
                if (gl.cs) cp.update(bindGroups, bindGroupLayouts, comp)
        }
        const render = (pass: GPURenderPassEncoder) => {
                if (gl.loading) return
                ensureShaders()
                if (needsUpdate) update()
                needsUpdate = false
                draw(pass)
        }
        const clean = () => {
                for (const { texture } of textures.map.values()) texture.destroy()
                for (const { buffer } of uniforms.map.values()) buffer.destroy()
                for (const { buffer } of attribs.map.values()) buffer.destroy()
        }
        return { render, clean, _attribute, _instance, _uniform, _texture, uniforms, textures, attribs }
}

export type WebGPUGraphic = ReturnType<typeof graphic>
