import { requestWebGPUDevice } from './device'
import {
        createCommandEncoder,
        createRenderPass,
        createRenderPipeline,
} from './pipeline'
import { wgsl } from '../code/wgsl'
import { is } from '../utils'
import type { X } from '../node'
import type { GL } from '../types'
export * from './buffer'
export * from './device'
export * from './pipeline'
export * from './texture'

export const webgpu = (self: GL) => {
        const init = async () => {
                const { device } = await requestWebGPUDevice()
                self.gl = { device }
                let vs = self.vs || self.vert || self.vertex
                let fs = self.fs || self.frag || self.fragment
                if (is.obj(vs)) vs = wgsl(fs as X)
                if (is.obj(fs)) fs = wgsl(fs as X)
                self.gl.pipeline = createRenderPipeline(device, vs, fs)
        }

        const loop = () => {
                const { device, context, pipeline } = self.gl
                const encoder = createCommandEncoder(device)
                const pass = createRenderPass(encoder, {
                        view: context.getCurrentTexture().createView(),
                        clearValue: { r: 0, g: 0, b: 0, a: 1 },
                        loadOp: 'clear',
                        storeOp: 'store',
                })
                pass.setPipeline(pipeline)
                pass.draw(self.count)
                pass.end()
                device.queue.submit([encoder.finish()])
        }

        // @TODO add uniform and attribute
        return self({ init, loop })
}
