import { wgsl } from './code/wgsl'
import { is } from './utils/helpers'
import {
        createRenderPipeline,
        createUniformBuffer,
        updateBindGroup,
        createUniform,
        createVertexBuffer,
        createDeviceTexture,
        createSampler,
} from './utils/pipeline'
import type { X } from './node'
import type { GL } from './types'
import { nested } from 'reev'

export const webgpu = async (gl: GL) => {
        let vs = gl.vs || gl.vert || gl.vertex
        let fs = gl.fs || gl.frag || gl.fragment
        if (is.obj(vs)) vs = wgsl(vs as X)
        if (is.obj(fs)) fs = wgsl(fs as X)
        // if (gl.count === 6) gl._attribute('a_position', a_position)
        const c = gl.el.getContext('webgpu') as any
        const gpu = (navigator as any).gpu
        const adapter = await gpu.requestAdapter()
        const device = await adapter.requestDevice()
        const format = gpu.getPreferredCanvasFormat()
        c.configure({ device, format })

        const pipeline = createRenderPipeline(device, vs, fs, format)
        const uniformBuffer = createUniformBuffer(device, 256)
        const vertexBuffers = nested((_, value) => createVertexBuffer(device, value))
        const uniforms = {} as any // @TODO FIX
        const sampler = createSampler(device)
        let bindGroup = updateBindGroup(device, pipeline, uniformBuffer)

        gl('clean', () => {})

        gl('render', () => {
                const encoder = device.createCommandEncoder()
                const colorAttachments = [
                        {
                                view: c.getCurrentTexture().createView(),
                                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                                loadOp: 'clear',
                                storeOp: 'store',
                        },
                ]
                const pass = encoder.beginRenderPass({ colorAttachments })
                pass.setPipeline(pipeline)
                pass.setBindGroup(0, bindGroup)
                // if (buffers?.a_position) {
                //         pass.setVertexBuffer(0, buffers.a_position)
                //         pass.draw(6)
                // }
                pass.end()
                device.queue.submit([encoder.finish()])
        })

        gl('_attribute', (key = '', value: number[]) => {
                vertexBuffers(key, value)
        })

        gl('_uniform', (key: string, value = 0) => {
                if (!device || !uniformBuffer) return
                uniforms[key] = value
                const uniformData = new Float32Array(Object.values(uniforms))
                createUniform(device, uniformBuffer, uniformData)
        })

        const _loadFun = (image: HTMLImageElement, gl: GL) => {
                const texture = createDeviceTexture(device, image)
                // bindGroup = updateBindGroup(device, pipeline, uniformBuffer, textures, sampler)
        }

        gl('_texture', (alt: string, src: string) => {
                const image = new Image()
                image.addEventListener('load', _loadFun.bind(null, image, gl), false)
                Object.assign(image, { src, alt, crossOrigin: 'anonymous' })
        })

        return gl
}
