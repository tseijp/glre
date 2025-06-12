import { wgsl } from './code/wgsl'
import { is } from './utils/helpers'
import {
        initWebGPUDevice,
        createRenderPipeline,
        createUniformBuffer,
        createBindGroup,
        updateBindGroup,
        updateUniform,
        createVertexBuffer,
        createTexture,
        createSampler,
} from './utils/webgpu'
import type { X } from './node'
import type { GL } from './types'

export const webgpu = (gl: GL) => {
        gl('init', async () => {
                let vs = gl.vs || gl.vert || gl.vertex
                let fs = gl.fs || gl.frag || gl.fragment
                if (is.obj(vs)) vs = wgsl(vs as X)
                if (is.obj(fs)) fs = wgsl(fs as X)

                const { device, format } = gl.gl
                const pipeline = createRenderPipeline(device, vs, fs, format)
                const uniformBuffer = createUniformBuffer(device, 256)
                const bindGroup = updateBindGroup(device, pipeline, uniformBuffer)
                gl.gl.pipeline = pipeline
                gl.gl.uniformBuffer = uniformBuffer
                gl.gl.bindGroup = bindGroup
                gl.gl.uniforms = {}
                gl.gl.textures = {}
                gl.gl.sampler = createSampler(device)
        })

        gl('clean', () => {})

        gl('render', () => {
                const { device, context, pipeline, bindGroup, vertexBuffers } = gl.gl
                const encoder = device.createCommandEncoder()
                const colorAttachments = [
                        {
                                view: context.getCurrentTexture().createView(),
                                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                                loadOp: 'clear',
                                storeOp: 'store',
                        },
                ]
                const pass = encoder.beginRenderPass({ colorAttachments })
                pass.setPipeline(pipeline)
                pass.setBindGroup(0, bindGroup)
                if (vertexBuffers?.a_position) pass.setVertexBuffer(0, vertexBuffers.a_position)
                pass.draw(gl.count)
                pass.end()
                device.queue.submit([encoder.finish()])
        })

        gl('_attribute', (key = '', value: number[]) => {
                const { device } = gl.gl
                const vertexBuffer = createVertexBuffer(device, value)
                if (!gl.gl.vertexBuffers) gl.gl.vertexBuffers = {}
                gl.gl.vertexBuffers[key] = vertexBuffer
        })

        gl('_uniform', (key: string, value = 0, isMatrix = false) => {
                const { device, uniformBuffer, uniforms } = gl.gl
                if (!device || !uniformBuffer) return
                uniforms[key] = value
                const uniformData = new Float32Array(Object.values(uniforms))
                updateUniform(device, uniformBuffer, uniformData)
        })

        const _loadFun = (image: HTMLImageElement, gl: GL) => {
                const { device, textures, pipeline, uniformBuffer, sampler } = gl.gl
                const texture = createTexture(device, image)
                textures[image.alt] = texture
                gl.gl.bindGroup = updateBindGroup(device, pipeline, uniformBuffer, textures, sampler)
        }

        gl('_texture', (alt: string, src: string) => {
                const image = new Image()
                image.addEventListener('load', _loadFun.bind(null, image, gl), false)
                Object.assign(image, { src, alt, crossOrigin: 'anonymous' })
        })

        return gl
}
