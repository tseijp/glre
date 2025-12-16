import { compute } from './compute'
import { graphic } from './graphic'
import { createBinding, createDevice, updatePipeline } from './utils'
import { is, WGSL_FS, WGSL_VS } from '../helpers'
import type { GL } from '../types'

export const webgpu = async (gl: GL) => {
        const isInit = !gl.context
        if (isInit) {
                const context = gl.el!.getContext('webgpu') as GPUCanvasContext
                const { device, format } = await createDevice(context, gl.error)
                gl({ context, device, format })
        }
        let needsUpdate = true
        gl('render', () => {
                if (needsUpdate) update()
                gl.encoder = gl.device.createCommandEncoder()
        })
        const binding = createBinding()
        const c = compute(gl, binding)
        const g = graphic(gl, binding, () => void (needsUpdate = true))
        const update = () => {
                if (gl.loading) return // MEMO: loading after build node
                needsUpdate = false
                const config = { isWebGL: false, gl, binding }
                const fs = gl.fs ? (is.str(gl.fs) ? gl.fs : gl.fs.fragment(config)) : WGSL_FS
                const vs = gl.vs ? (is.str(gl.vs) ? gl.vs : gl.vs.vertex(config)) : WGSL_VS
                const cs = gl.cs ? (is.str(gl.cs) ? gl.cs : gl.cs.compute(config)) : ''
                const { computePipeline, graphicPipeline, bindGroups, vertexBuffers } = updatePipeline(gl.device, gl.format, g.attribs.map.values(), g.uniforms.map.values(), g.textures.map.values(), c.storages.map.values(), fs, cs, vs)
                c.set(computePipeline, bindGroups)
                g.set(graphicPipeline, bindGroups, vertexBuffers)
        }
        gl('render', () => {
                if (gl.encoder) gl.device.queue.submit([gl.encoder.finish()])
        })

        gl('clean', () => {
                gl.device.destroy()
        })
}
