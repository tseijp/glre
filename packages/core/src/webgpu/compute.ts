import { nested } from 'reev'
import { createArrayBuffer, createComputePipeline, workgroupCount } from './utils'
import type { GL } from '../types'

export const compute = (gl: GL, device: GPUDevice, bindings: any) => {
        let flush = (_pass: GPUComputePassEncoder) => {}

        const storages = nested((_key, value: number[] | Float32Array) => {
                const { array, buffer } = createArrayBuffer(device, value, 'storage')
                const { binding, group } = bindings.storage()
                return { array, buffer, binding, group }
        })

        const _storage = (key: string, value: number[] | Float32Array) => {
                const { array, buffer } = storages(key, value)
                device.queue.writeBuffer(buffer, 0, array as any)
        }

        const update = (bindGroups: GPUBindGroup[], bindGroupLayouts: GPUBindGroupLayout[], comp: string) => {
                const pipeline = createComputePipeline(device, bindGroupLayouts, comp!)
                flush = (pass) => {
                        pass.setPipeline(pipeline)
                        bindGroups.forEach((v, i) => pass.setBindGroup(i, v))
                        const { x, y, z } = workgroupCount(gl.particleCount)
                        pass.dispatchWorkgroups(x, y, z)
                        pass.end()
                }
        }

        const render = (pass: GPUComputePassEncoder) => {
                flush(pass)
        }

        const clean = () => {
                for (const { buffer } of storages.map.values()) buffer.destroy()
        }

        return { storages, _storage, update, render, clean }
}

export type WebGPUCompute = ReturnType<typeof compute>
