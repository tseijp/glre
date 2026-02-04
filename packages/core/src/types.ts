import type { EventState } from 'reev'
import type { DragState } from 'reev/gesture/drag'
import type { Queue, Frame } from 'refr'
import type { Vec4, Void } from './node'
import type { Binding } from './webgpu/utils'

export type Drag = EventState<DragState<HTMLCanvasElement>>

export type GL = EventState<{
        /**
         * initial value
         */
        isNative: boolean
        isWebGL: boolean
        isError: boolean
        isLoop: boolean
        isDebug: boolean
        isDepth: boolean
        wireframe: boolean
        width?: number
        height?: number
        size: [number, number]
        mouse: [number, number]
        offset: [number, number]
        count: number // triangleCount × 3
        triangleCount: number
        instanceCount: number
        particleCount: number | [number, number] | [number, number, number]
        precision: 'lowp' | 'mediump' | 'highp'
        element?: HTMLCanvasElement
        elem?: HTMLCanvasElement
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
        uniforms?: Record<string, Uniform | null>
        textures?: Record<string, Texture | null>
        storages?: Record<string, Storage | null>
        instances?: Record<string, Storage | null>
        attributes?: Record<string, Storage | null>
        program: WebGLProgram
        context: WebGL2RenderingContext
        gpu: GPUCanvasContext
        device: GPUDevice
        format: GPUTextureFormat
        passEncoder: GPURenderPassEncoder
        commandEncoder: GPUCommandEncoder
        depthTexture?: GPUTexture
        binding: Binding

        /**
         * core state
         */
        // webgpu: WebGPUState
        // webgl: WebGLState
        queue: Queue
        frame: Frame

        /**
         * events
         */
        ref?(el: HTMLCanvasElement | null): void
        mount(): void
        clean(): void
        error(e?: string): void
        render(): void
        resize(e?: Event): void
        dragStart(drag: Drag): void
        dragging(drag: Drag): void
        dragEnd(drag: Drag): void
        drag(drag: Drag): void
        /**
         * setter
         */
        _uniform?(key: string, value: Uniform, isMatrix?: boolean): GL
        uniform(key: string, value: Uniform, isMatrix?: boolean): GL
        uniform(target: { [key: string]: Uniform }): GL
        _texture?(key: string, value: Texture): GL
        texture(key: string, value: Texture): GL
        texture(target: { [key: string]: Texture }): GL
        _attribute?(key: string, value: Storage, iboValue?: Storage): GL
        attribute(key: string, value: Storage, iboValue?: Storage): GL
        attribute(target: { [key: string]: Storage }): GL
        _instance?(key: string, value: Storage, at?: number): GL
        instance(key: string, value: Storage, at?: number): GL
        instance(target: { [key: string]: Storage }): GL
        _storage?(key: string, value: Storage): GL
        storage(key: string, value: Storage): GL
        storage(target: { [key: string]: Storage }): GL
        setCount(next: number): void
        setTriangleCount(next: number): void
        setInstanceCount(next: number): void
}>

type Uniform = number | number[] | Float32Array
type Texture = string | HTMLImageElement | HTMLVideoElement
type Storage = number[] | Float32Array

/**
 * for webgpu
 */
export interface UniformData {
        binding: number
        group: number
        array: Float32Array
        buffer: GPUBuffer
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
        isInstance?: boolean
}

export interface StorageData {
        array: Float32Array
        buffer: GPUBuffer
        binding: number
        group: number
}

// export interface WebGPUState {
//         device: GPUDevice
//         uniforms: Nested<UniformData>
//         textures: Nested<TextureData>
//         attribs: Nested<AttribData>
//         storages: Nested<StorageData>
// }
//
// /**
//  * for webgl
//  */
// export interface WebGLState {
//         context: WebGL2RenderingContext
//         program: WebGLProgram
//         uniforms: Nested<WebGLUniformLocation | null>
// }
