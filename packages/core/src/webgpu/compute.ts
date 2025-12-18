import { nested } from 'reev'
import { createBuffer, updateBuffer, workgroupCount } from './utils'
import type { Binding } from './utils'
import type { GL } from '../types'

export const compute = (gl: GL, bindings: Binding) => {
        let pipeline: GPUComputePipeline | undefined
        let bindGroups: GPUBindGroup[] | undefined

        const storages = nested((key, value: number[] | Float32Array) => {
                return { ...bindings.storage(key), ...createBuffer(gl.device, value, 'storage') }
        })

        gl('_storage', (key: string, value: number[] | Float32Array) => {
                const { array, buffer } = storages(key, value)
                updateBuffer(gl.device, value, array, buffer)
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
