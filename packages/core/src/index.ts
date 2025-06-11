import { webgl } from './webgl/index'
import { webgpu } from './webgpu/index'
import type { GL, Fun } from './types'
export type { GL, Fun }
export * from './code/glsl'
export * from './code/wgsl'
export * from './node'
export * from './webgl'
export * from './webgpu'

export const isWebGPUSupported = (): boolean => 'gpu' in navigator
export const createGL = (props?: Partial<GL>) => {
        if (props?.webgl || !isWebGPUSupported()) return webgl(props)
        return webgpu(props)
}

export const gl = createGL()
export default gl
