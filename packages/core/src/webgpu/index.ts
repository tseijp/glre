import { requestWebGPUDevice } from './device'
import { createCommandEncoder, createRenderPass, createRenderPipeline } from './pipeline'
import { wgsl } from '../code/wgsl'
import { is } from '../utils'
import type { X } from '../node'
import type { GL } from '../types'
export * from './buffer'
export * from './device'
export * from './pipeline'
export * from './texture'

export const webgpu = (gl: GL) => {
        const init = async () => {
                const { device } = await requestWebGPUDevice()
                gl.gl = { device }
                let vs = gl.vs || gl.vert || gl.vertex
                let fs = gl.fs || gl.frag || gl.fragment
                if (is.obj(vs)) vs = wgsl(fs as X)
                if (is.obj(fs)) fs = wgsl(fs as X)
                gl.gl.pipeline = createRenderPipeline(device, vs, fs)
        }

        const loop = () => {
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
        }

        // @TODO add uniform and attribute
        return gl({ init, loop })
}
