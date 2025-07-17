import type { EventState, Nested } from 'reev'
import type { Fun, Queue, Frame } from 'refr'
import type { NodeProxy, Vec4 } from './node'
export type { Fun, Queue, Frame }
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
        view: GPUTextureView
}

export interface AttribData {
        array: Float32Array
        buffer: GPUBuffer
        location: number
        stride: number
}

export interface WebGLState {
        context: WebGLRenderingContext
        program: WebGLProgram
}

export interface WebGPUState {
        device: GPUDevice
        uniforms: Nested<UniformData>
        textures: Nested<TextureData>
        attribs: Nested<AttribData>
}

export type Uniform = number | number[]
export type Attribute = number[]
export type Attributes = Record<string, Attribute>
export type Uniforms = Record<string, Uniform>

export type GL = EventState<{
        /**
         * initial value
         */
        isNative: boolean
        isWebGL: boolean
        isError: boolean
        isLoop: boolean
        isGL: true
        width?: number
        height?: number
        size: [number, number]
        mouse: [number, number]
        count: number
        loading: number
        el: HTMLCanvasElement
        vs?: string | Vec4
        fs?: string | Vec4
        vert?: string | Vec4
        frag?: string | Vec4
        vertex?: string | Vec4
        fragment?: string | Vec4

        /**
         * core state
         */
        webgpu: WebGPUState
        webgl: WebGLState
        queue: Queue
        frame: Frame

        /**
         * events
         */
        ref?: any
        mount(): void
        clean(): void
        error(e?: string): void
        render(): void
        resize(e?: Event): void
        mousemove(e: Event): void
        loop(): void

        /**
         * setter
         */
        _uniform?(key: string, value: Uniform, isMatrix?: boolean): GL
        uniform(key: string, value: Uniform, isMatrix?: boolean): GL
        uniform(node: NodeProxy): GL
        uniform(target: { [key: string]: Uniform }): GL
        _texture?(key: string, value: string): GL
        texture(key: string, value: string): GL
        texture(target: { [key: string]: string }): GL
        _attribute?(key: string, value: Attribute, iboValue?: Attribute): GL
        attribute(key: string, value: Attribute, iboValue?: Attribute): GL
        attribute(target: { [key: string]: Attribute }): GL
}>
