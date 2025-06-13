import { wgsl } from './code/wgsl'
import { is } from './utils/helpers'
import {
        createRenderPipeline,
        createDescriptor,
        // createUniformBuffer,
        // updateBindGroup,
        // createVertexBuffer,
        // createUniform,
        // createDeviceTexture,
        // createSampler,
} from './utils/pipeline'
import type { X } from './node'
import type { GL, GPUPipeline } from './types'

const quadVertexCount = 3

export const webgpu = async (gl: GL) => {
        let vs = gl.vs || gl.vert || gl.vertex
        let fs = gl.fs || gl.frag || gl.fragment
        if (is.obj(vs)) vs = wgsl(vs as X)
        if (is.obj(fs)) fs = wgsl(fs as X)
        const c = gl.el.getContext('webgpu') as any
        const gpu = (navigator as any).gpu
        const adapter = await gpu.requestAdapter()
        const device = await adapter.requestDevice()
        const format = gpu.getPreferredCanvasFormat()
        c.configure({ device, format, alphaMode: 'opaque' })

        gl('clean', () => {})

        let pipeline: GPUPipeline

        gl('render', () => {
                if (!pipeline) pipeline = createRenderPipeline(device, format, vs, fs, [])
                const encoder = device.createCommandEncoder()
                const pass = encoder.beginRenderPass(createDescriptor(c))
                pass.setPipeline(pipeline)
                pass.draw(quadVertexCount, 1, 0, 0)
                pass.end()
                device.queue.submit([encoder.finish()])
        })

        gl('_attribute', (key = '', value: number[]) => {
                // @TODO FIX
                // vertexBuffers(key, value)
        })

        gl('_uniform', (key: string, value = 0) => {
                // @TODO FIX
                // if (!device || !uniformBuffer) return
                // uniforms[key] = value
                // const uniformData = new Float32Array(Object.values(uniforms))
                // createUniform(device, uniformBuffer, uniformData)
        })

        // const _loadFun = (image: HTMLImageElement, gl: GL) => {
        //         const texture = createDeviceTexture(device, image)
        //         // bindGroup = updateBindGroup(device, pipeline, uniformBuffer, textures, sampler)
        // }

        gl('_texture', (alt: string, src: string) => {
                // @TODO FIX
                // const image = new Image()
                // image.addEventListener('load', _loadFun.bind(null, image, gl), false)
                // Object.assign(image, { src, alt, crossOrigin: 'anonymous' })
        })

        return gl
}
