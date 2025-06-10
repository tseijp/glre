import { webgl } from './webgl/index'
import { webgpu } from './webgpu/index'
import type { GL, Fun } from './types'
export type { GL, Fun }

export const isWebGPUSupported = (): boolean => 'gpu' in navigator
export const createGL = async (props?: Partial<GL>) => {
        if (isWebGPUSupported()) return await webgpu(props)
        return webgl(props)
}

export const gl = await createGL()
export default gl

export * from './code/glsl'
export * from './code/wgsl'
export * from './node'
export * from './webgl'
export * from './webgpu'
