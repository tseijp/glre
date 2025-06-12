import { wgsl } from './code/wgsl'
import { is } from './utils/helpers'
import {
        createRenderPipeline,
        // createUniformBuffer,
        // updateBindGroup,
        // createVertexBuffer,
        createDescriptor,
        // createUniform,
        // createDeviceTexture,
        // createSampler,
} from './utils/pipeline'
import type { X } from './node'
import type { GL } from './types'

const quadVertexSize = 4 * 8
const quadPositionOffset = 4 * 0
const quadColorOffset = 4 * 4
const quadVertexCount = 6

// prettier-ignore
export const quadVertexArray = new Float32Array([
       // float4 position, float4 color
       -1,  1, 0, 1,   0, 1, 0, 1,
       -1, -1, 0, 1,   0, 0, 0, 1,
        1, -1, 0, 1,   1, 0, 0, 1,
       -1,  1, 0, 1,   0, 1, 0, 1,
        1, -1, 0, 1,   1, 0, 0, 1,
        1,  1, 0, 1,   1, 1, 0, 1,
]);

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

        // buffer
        const verticesBuffer = device.createBuffer({
                size: quadVertexArray.byteLength, // @ts-ignore
                usage: GPUBufferUsage.VERTEX,
                mappedAtCreation: true,
        })
        new Float32Array(verticesBuffer.getMappedRange()).set(quadVertexArray)
        verticesBuffer.unmap()
        const buffers = [
                {
                        arrayStride: quadVertexSize,
                        attributes: [
                                {
                                        // position
                                        shaderLocation: 0, // @location(0) in vertex shader
                                        offset: quadPositionOffset,
                                        format: 'float32x4',
                                },
                                {
                                        // color
                                        shaderLocation: 1, // @location(1) in vertex shader
                                        offset: quadColorOffset,
                                        format: 'float32x4',
                                },
                        ],
                },
        ]

        const pipeline = createRenderPipeline(device, format, vs, fs, buffers)
        // const uniformBuffer = createUniformBuffer(device, 256)
        // const vertexBuffers = nested((_, value) => createVertexBuffer(device, value))
        // const bindGroup = updateBindGroup(device, pipeline, uniformBuffer)

        gl('clean', () => {})

        gl('render', () => {
                const encoder = device.createCommandEncoder()
                const pass = encoder.beginRenderPass(createDescriptor(c))
                pass.setPipeline(pipeline)
                // pass.setBindGroup(0, bindGroup)
                pass.setVertexBuffer(0, verticesBuffer)
                pass.draw(quadVertexCount, 1, 0, 0)
                pass.end()
                device.queue.submit([encoder.finish()])
        })

        gl('_attribute', (key = '', value: number[]) => {
                // vertexBuffers(key, value)
        })

        gl('_uniform', (key: string, value = 0) => {
                // if (!device || !uniformBuffer) return
                // uniforms[key] = value
                // const uniformData = new Float32Array(Object.values(uniforms))
                // createUniform(device, uniformBuffer, uniformData)
        })

        // const _loadFun = (image: HTMLImageElement, gl: GL) => {
        //         const texture = createDeviceTexture(device, image)
        //         // bindGroup = updateBindGroup(device, pipeline, uniformBuffer, textures, sampler)
        // }

        // gl('_texture', (alt: string, src: string) => {
        //         const image = new Image()
        //         image.addEventListener('load', _loadFun.bind(null, image, gl), false)
        //         Object.assign(image, { src, alt, crossOrigin: 'anonymous' })
        // })

        return gl
}
