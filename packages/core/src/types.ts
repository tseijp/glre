import { EventState } from 'reev'
import type { Fun, Queue, Frame } from 'refr'
import type { NodeProxy } from './node'
export type { Fun, Queue, Frame }
export type Uniform = number | number[]
export type Attribute = number[]
export type Attributes = Record<string, Attribute>
export type Uniforms = Record<string, Uniform>
export type PrecisionMode = 'highp' | 'mediump' | 'lowp'
export type GLClearMode = 'COLOR_BUFFER_BIT' | 'DEPTH_BUFFER_BIT' | 'STENCIL_BUFFER_BIT'
export type GLDrawType = 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT' | 'UNSIGNED_INT'
export type GLDrawMode =
        | 'POINTS'
        | 'LINE_STRIP'
        | 'LINE_LOOP'
        | 'LINES'
        | 'TRIANGLE_STRIP'
        | 'TRIANGLE_FAN'
        | 'TRIANGLES'

export interface UniformData {
        array: Float32Array
        buffer: GPUBuffer
        binding: number
        group: number
}

export interface TextureData {
        binding: number
        group: number
        texture: GPUTexture
        sampler: GPUSampler
}

export interface AttributeData {
        array: Float32Array
        buffer: GPUBuffer
        location: number
        stride: number
        offset: number
}

export interface WebGLState {
        context: WebGLRenderingContext
        program: WebGLProgram
}

export interface WebGPUState {
        device: GPUDevice
        context: GPUCanvasContext
        pipeline: GPURenderPipeline
        groups: any[]
        resources: any[]
        needsUpdate: boolean
        imageLoading: number
        bindGroups: GPUBindGroup[]
        vertexBuffers: GPUBuffer[]
}

export interface ResourceState {
        uniforms: any
        textures: any
        attributes: any
        bindingManager: any
}

export type GL = EventState<{
        /**
         * initial value
         */
        isNative: boolean
        isWebGL: boolean
        isLoop: boolean
        isGL: true
        width: number
        height: number
        size: [number, number]
        mouse: [number, number]
        count: number
        el: HTMLCanvasElement
        vs: string | NodeProxy
        fs: string | NodeProxy
        vert: string | NodeProxy
        frag: string | NodeProxy
        vertex: string | NodeProxy
        fragment: string | NodeProxy
        bindings?: any

        /**
         * core state
         */
        webgpu: WebGPUState
        webgl: WebGLState
        queue: Queue
        frame: Frame
        state: ResourceState

        /**
         * events
         */
        ref?: any
        init(): void
        loop(): void
        mount(): void
        clean(): void
        render(): void
        resize(e?: Event): void
        mousemove(e: Event): void

        /**
         * setter
         */
        _uniform?(key: string, value: Uniform, isMatrix?: boolean): GL
        uniform(key: string, value: Uniform, isMatrix?: boolean): GL
        uniform(target: { [key: string]: Uniform }): GL
        _texture?(key: string, value: string): GL
        texture(key: string, value: string): GL
        texture(target: { [key: string]: string }): GL
        _attribute?(key: string, value: Attribute, iboValue?: Attribute): GL
        attribute(key: string, value: Attribute, iboValue?: Attribute): GL
        attribute(target: { [key: string]: Attribute }): GL
}>
