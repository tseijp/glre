import { compute } from './compute'
import { graphic } from './graphic'
import { createBinding, createDepthTexture, createDescriptor, createDevice, updatePipeline } from './utils'
import { is, WGSL_FS, WGSL_VS } from '../helpers'
import type { GL } from '../types'

export const webgpu = async (gl: GL, isLast = false) => {
        let { vs, fs, cs } = gl
        let isUpdate = true
        const isInit = !gl.gpu
        if (isInit) {
                const gpu = gl.el!.getContext('webgpu') as GPUCanvasContext
                const binding = createBinding()
                const { device, format } = await createDevice(gpu, gl.error)
                gl({ device, format, binding, gpu })
                gl('resize', () => {
                        gl.depthTexture?.destroy()
                        if (gl.isDepth) gl.depthTexture = createDepthTexture(gl.device, ...gl.size)
                })
        }

        gl('render', () => {
                if (isUpdate) update()
        })

        if (isInit)
                gl('render', () => {
                        gl.commandEncoder = gl.device.createCommandEncoder()
                })

        const c = compute(gl)

        if (isInit)
                gl('render', () => {
                        gl.passEncoder = gl.commandEncoder.beginRenderPass(createDescriptor(gl.gpu, gl.depthTexture))
                })

        const g = graphic(gl, () => (isUpdate = true))

        const update = () => {
                isUpdate = false
                const config = { isWebGL: false, gl }
                fs = fs ? (is.str(fs) ? fs : fs.fragment(config)) : WGSL_FS
                vs = vs ? (is.str(vs) ? vs : vs.vertex(config)) : WGSL_VS
                cs = cs ? (is.str(cs) ? cs : cs.compute(config)) : ''
                const p = updatePipeline(gl.device, gl.format, g.attributes.map.values(), g.uniforms.map.values(), g.textures.map.values(), c.storages.map.values(), fs, cs, vs, gl.isDepth)
                c.set(p.computePipeline, p.bindGroups)
                g.set(p.graphicPipeline, p.bindGroups, p.vertexBuffers)
        }

        if (isLast)
                gl('render', () => {
                        gl.passEncoder.end()
                        gl.device.queue.submit([gl.commandEncoder.finish()])
                })

        gl('clean', () => {
                gl.depthTexture?.destroy()
                gl.device.destroy()
        })
}
