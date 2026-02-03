import { nested } from 'reev'
import { createBuffer, updateBuffer, workgroupCount } from './utils'
import type { GL } from '../types'

export const compute = (gl: GL) => {
        const { particleCount, storages } = gl // Save this WebGPU instance's particleCount (overwritten per args)
        let pipeline: GPUComputePipeline | undefined
        let bindGroups: GPUBindGroup[] | undefined

        const _storages = nested((key, value: number[] | Float32Array) => {
                return { ...gl.binding.storage(key), ...createBuffer(gl.device, value, 'storage') }
        })

        gl('_storage', (key: string, value: number[] | Float32Array) => {
                if (storages && !(key in storages)) return
                const { array, buffer } = _storages(key, value)
                updateBuffer(gl.device, value, array, buffer)
        })

        gl('render', () => {
                if (!pipeline || !bindGroups) return
                const pass = gl.commandEncoder.beginComputePass()
                pass.setPipeline(pipeline)
                bindGroups.forEach((v, i) => pass.setBindGroup(i, v))
                const { x, y, z } = workgroupCount(particleCount)
                pass.dispatchWorkgroups(x, y, z)
                pass.end()
        })

        gl('clean', () => {
                for (const { buffer } of _storages.map.values()) buffer.destroy()
        })

        const set = (_pipeline?: GPUComputePipeline, _bindGroups?: GPUBindGroup[]) => {
                pipeline = _pipeline
                bindGroups = _bindGroups
        }

        return { _storages, set }
}
