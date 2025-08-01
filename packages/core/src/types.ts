import type { EventState, Nested } from 'reev'
import type { Fun, Queue, Frame } from 'refr'
import type { Vec4, Void } from './node'
export type { Fun, Queue, Frame }

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
        particles: 64 | 256 | 576 | 1024 | 1600 | 2304 | 3136 | 4096 | 4096 | 5184 | 6400 // (8k)^2
        el: HTMLCanvasElement
        vs?: string | Vec4
        cs?: string | Void
        fs?: string | Vec4
        vert?: string | Vec4
        comp?: string | Void
        frag?: string | Vec4
        vertex?: string | Vec4
        compute?: string | Void
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
        uniform(target: { [key: string]: Uniform }): GL
        _texture?(key: string, value: string): GL
        texture(key: string, value: string): GL
        texture(target: { [key: string]: string }): GL
        _attribute?(key: string, value: Attribute, iboValue?: Attribute): GL
        attribute(key: string, value: Attribute, iboValue?: Attribute): GL
        attribute(target: { [key: string]: Attribute }): GL
        _storage?(key: string, value: Storage): GL
        storage(key: string, value: Storage): GL
        storage(target: { [key: string]: Storage }): GL
}>

type Uniform = number | number[] | Float32Array
type Attribute = number[] | Float32Array
type Storage = number[] | Float32Array

/**
 * for webgpu
 */
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

export interface StorageData {
        array: Float32Array
        buffer: GPUBuffer
        binding: number
        group: number
}

export interface WebGPUState {
        device: GPUDevice
        uniforms: Nested<UniformData>
        textures: Nested<TextureData>
        attribs: Nested<AttribData>
        storages: Nested<StorageData>
}

/**
 * for webgl
 */
export interface WebGLState {
        context: WebGLRenderingContext
        program: WebGLProgram
        storages: any
}
