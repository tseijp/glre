import { wgsl } from './code/wgsl'
import { is } from './utils/helpers'
import { createCommandEncoder, createRenderPass, createRenderPipeline, requestWebGPUDevice } from './utils/webgpu'
import type { X } from './node'
import type { GL } from './types'

export const webgpu = (gl: GL) => {
        gl('init', async () => {
                const { device } = await requestWebGPUDevice()
                gl.gl = { device }
                let vs = gl.vs || gl.vert || gl.vertex
                let fs = gl.fs || gl.frag || gl.fragment
                if (is.obj(vs)) vs = wgsl(fs as X)
                if (is.obj(fs)) fs = wgsl(fs as X)
                gl.gl.pipeline = createRenderPipeline(device, vs, fs)
        })

        gl('clean', () => {})

        gl('render', () => {
                const { device, context, pipeline } = gl.gl
                const encoder = createCommandEncoder(device)
                const pass = createRenderPass(encoder, {
                        view: context.getCurrentTexture().createView(),
                        clearValue: { r: 0, g: 0, b: 0, a: 1 },
                        loadOp: 'clear',
                        storeOp: 'store',
                })
                pass.setPipeline(pipeline)
                pass.draw(gl.count)
                pass.end()
                device.queue.submit([encoder.finish()])
        })

        gl('_attribute', (key = '', value: number[], iboValue: number[]) => {})

        gl('_uniform', (key: string, value = 0, isMatrix = false) => {})

        gl('_texture', (alt: string, src: string) => {})

        return gl
}
