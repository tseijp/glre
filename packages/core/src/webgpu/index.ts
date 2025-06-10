import { requestWebGPUDevice } from './device'
import {
        createCommandEncoder,
        createRenderPass,
        createRenderPipeline,
} from './pipeline'
import { base } from '../base'
import { wgsl } from '../code/wgsl'
import { updateUniforms } from '../node'
import type { NodeProxy } from '../node'
import type { GL } from '../../types'
export * from './buffer'
export * from './device'
export * from './pipeline'
export * from './texture'

let iTime = performance.now(),
        iPrevTime = 0,
        iDeltaTime = 0

// WebGPU実装
export const webgpu = async (props?: Partial<GL>) => {
        const { device } = await requestWebGPUDevice()

        const init = () => {
                self(props)

                let vs = self.vs || self.vert || self.vertex
                let fs = self.fs || self.frag || self.fragment

                // ノードからシェーダー生成
                if (self.fragmentNode) fs = wgsl(self.fragmentNode as NodeProxy)

                self.pipeline = createRenderPipeline(device, vs, fs)

                self.frame(() => {
                        self.render()
                        return true
                })
        }

        const loop = () => {
                const encoder = createCommandEncoder(device)
                const pass = createRenderPass(encoder, {
                        view: self.context.getCurrentTexture().createView(),
                        clearValue: { r: 0, g: 0, b: 0, a: 1 },
                        loadOp: 'clear',
                        storeOp: 'store',
                })

                pass.setPipeline(self.pipeline)
                pass.draw(6)
                pass.end()

                device.queue.submit([encoder.finish()])

                iPrevTime = iTime
                iTime = performance.now() / 1000
                iDeltaTime = iTime - iPrevTime
                if (self.fragmentNode) updateUniforms({ time: iTime })
        }

        const self = base({
                ...props,
                rnderer: 'webgpu',
                init,
                loop,
        })

        return self
}
