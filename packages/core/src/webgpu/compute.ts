import { nested as cached } from 'reev'
import { createArrayBuffer, workgroupCount } from './utils'
import type { Binding } from './utils'
import type { GL } from '../types'

export const compute = (gl: GL, bindings: Binding) => {
        let pipeline: GPUComputePipeline | undefined
        let bindGroups: GPUBindGroup[] | undefined

        const storages = cached((key, value: number[] | Float32Array) => {
                const { array, buffer } = createArrayBuffer(gl.device, value, 'storage')
                const { binding, group } = bindings.storage(key)
                return { array, buffer, binding, group }
        })

        gl('_storage', (key: string, value: number[] | Float32Array) => {
                const { array, buffer } = storages(key, value)
                gl.device.queue.writeBuffer(buffer, 0, array as any)
        })

        gl('render', () => {
                if (!pipeline || !bindGroups) return
                const pass = gl.encoder.beginComputePass()
                pass.setPipeline(pipeline)
                bindGroups.forEach((v, i) => pass.setBindGroup(i, v))
                const { x, y, z } = workgroupCount(gl.particleCount)
                pass.dispatchWorkgroups(x, y, z)
                pass.end()
        })

        gl('clean', () => {
                for (const { buffer } of storages.map.values()) buffer.destroy()
        })

        const set = (_pipeline?: GPUComputePipeline, _bindGroups?: GPUBindGroup[]) => {
                pipeline = _pipeline
                bindGroups = _bindGroups
        }

        return { storages, set }
}
