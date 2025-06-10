import { webgl } from './src/webgl/index'
import { webgpu } from './src/webgpu/index'
import type { GL, Fun } from './types'
export type { GL, Fun }

export const isWebGPUSupported = (): boolean => 'gpu' in navigator
export const createGL = async (props?: Partial<GL>) => {
        if (isWebGPUSupported()) return await webgpu(props)
        return webgl(props)
}

export const gl = await createGL()
export default gl

export * from './src/code/glsl'
export * from './src/code/wgsl'
export * from './src/node'
export * from './src/webgl'
export * from './src/webgpu'
