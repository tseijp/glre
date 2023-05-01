/**
 * ref: https://stackoverflow.com/questions/52489261/typescript-can-i-define-an-n-length-tuple-type
 */
import type { Frame, Fun } from 'refr'
import type { Nested, EventState } from 'reev/types'

export type Uniform = number | number[]

export type Attribute = number[]

export type Attributes = Record<string, Attribute>

export type Uniforms = Record<string, Uniform>

export interface GLEvent {
        mount(): void
        clean(): void
        mousemove(e: Event): void
        resize(e?: Event): void
        load(e?: Event, image?: HTMLImageElement): void
}

export interface GL {
        (fun: Fun): GL
        (shader: string): GL
        (strings: TemplateStringsArray, ...args: any[]): GL
        /**
         * initial value
         */
        id: string
        size: [number, number]
        mouse: [number, number]
        count: number
        frag: string
        vert: string
        int: PrecisionMode
        float: PrecisionMode
        sampler2D: PrecisionMode
        samplerCube: PrecisionMode
        lastActiveUnit: number
        uniformHeader: [string, string][]
        attributeHeader: [string, string][]
        /**
         * core state
         */
        gl: any
        pg: any
        el: any
        event: EventState<GLEvent>
        frame: Frame
        stride: Nested<number> // @TODO Nested<(key: string, value: number: number[], ibo: number[]) => number>
        location: Nested<any>
        activeUnit: Nested<number>
        uniformType: Nested<string>
        vertexStride: Nested<number>
        default: GL
        /**
         * setter
         */
        setDpr(...args: any[]): GL
        setSize(...args: any[]): GL
        setFrame(frame: Fun): GL
        setMount(frame: Fun): GL
        setClean(frame: Fun): GL
        setUniform(key: string, value: Uniform): GL
        setUniform(target: { [key: string]: Uniform }): GL
        setTexture(key: string, value: string): GL
        setTexture(target: { [key: string]: string }): GL
        setAttribute(key: string, value: Attribute, iboValue?: Attribute): GL
        setAttribute(target: { [key: string]: Attribute }): GL
        setConfig(key?: keyof GL, value?: GL[keyof GL]): GL
        setConfig(target?: Partial<GL>): GL
        mount(): void
        clean(): void
        clear(key?: GLClearMode): void
        viewport(size?: [number, number]): void
        drawArrays(key?: GLDrawMode): void
        drawElements(key?: GLDrawMode): void
}

export type PrecisionMode = 'highp' | 'mediump' | 'lowp'

export type GLClearMode =
        | 'COLOR_BUFFER_BIT'
        | 'DEPTH_BUFFER_BIT'
        | 'STENCIL_BUFFER_BIT'

export type GLDrawMode =
        | 'POINTS'
        | 'LINE_STRIP'
        | 'LINE_LOOP'
        | 'LINES'
        | 'TRIANGLE_STRIP'
        | 'TRIANGLE_FAN'
        | 'TRIANGLES'

export type GLDrawType = 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT' | 'UNSIGNED_INT'
