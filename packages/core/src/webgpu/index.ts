import { compute } from './compute'
import { graphic } from './graphic'
import { createBindings, createDepthTexture, createDescriptor, createDevice } from './utils'
import type { GL, WebGPUState } from '../types'

export const webgpu = async (gl: GL) => {
        const abort = new AbortController()
        const context = gl.el.getContext('webgpu') as GPUCanvasContext
        const { device, format } = await createDevice(context, gl.error, abort.signal)
        const bindings = createBindings()
        const cp = compute(gl, device, bindings)
        let depthTexture: GPUTexture

        const renderers = [] as ReturnType<typeof graphic>[]
        renderers.push(graphic(gl, gl, device, format))
        if (gl.programs && gl.programs.length) gl.programs.forEach((p: any) => renderers.push(graphic(gl, p, device, format)))

        const resize = () => {
                depthTexture?.destroy()
                depthTexture = createDepthTexture(device, gl.el.width, gl.el.height)
        }

        const clean = () => {
                abort.abort()
                device.destroy()
                depthTexture?.destroy()
                renderers.forEach((r) => r.clean())
                cp.clean()
        }

        const _attribute = (k = '', v: number[]) => renderers.forEach((r) => r._attribute(k, v))
        const _instance = (k: string, v: number[]) => renderers.forEach((r) => r._instance(k, v))
        const _uniform = (k: string, v: number | number[]) => renderers.forEach((r) => r._uniform(k, v))
        const _texture = (k: string, v: string) => renderers.forEach((r) => r._texture(k, v))

        const render = () => {
                const encoder = device.createCommandEncoder()
                if (gl.cs) cp.render(encoder.beginComputePass())
                const pass = encoder.beginRenderPass(createDescriptor(context, depthTexture))
                renderers.forEach((r) => r.render(pass))
                pass.end()
                device.queue.submit([encoder.finish()])
        }

        resize()

        const webgpu = { device, uniforms: renderers[0].uniforms, textures: renderers[0].textures, attribs: renderers[0].attribs, storages: cp.storages } as WebGPUState

        return { webgpu, render, resize, clean, _attribute, _instance, _uniform, _texture, _storage: cp._storage }
}
