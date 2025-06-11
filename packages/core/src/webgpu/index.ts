import { requestWebGPUDevice } from './device'
import {
        createCommandEncoder,
        createRenderPass,
        createRenderPipeline,
} from './pipeline'
import { base } from '../base'
import { wgsl } from '../code/wgsl'
import type { X } from '../node'
import type { GL } from '../types'
import { is } from '../utils'
export * from './buffer'
export * from './device'
export * from './pipeline'
export * from './texture'

let iTime = performance.now(),
        iPrevTime = 0,
        iDeltaTime = 0

// WebGPU実装
export const webgpu = (props?: Partial<GL>) => {
        const init = async () => {
                self(props)
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
                pass.draw(6)
                pass.end()
                device.queue.submit([encoder.finish()])
                iPrevTime = iTime
                iTime = performance.now() / 1000
                iDeltaTime = iTime - iPrevTime
                // if (self.fragmentNode) updateUniforms({ time: iTime }) // @TODO FIX
        }

        // @TODO add uniform and attribute

        const self = base(props)
        self.webgl = false
        self.init = init
        self.loop = loop
        return self
}
