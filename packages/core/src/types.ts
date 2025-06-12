import { Nested, EventState } from 'reev'
import type { Fun, Queue, Frame } from 'refr'
import type { X } from './node'
export type { Fun, Queue, Frame }
export type Uniform = number | number[]
export type Attribute = number[]
export type Attributes = Record<string, Attribute>
export type Uniforms = Record<string, Uniform>
export type PrecisionMode = 'highp' | 'mediump' | 'lowp'

export type GLClearMode = 'COLOR_BUFFER_BIT' | 'DEPTH_BUFFER_BIT' | 'STENCIL_BUFFER_BIT'

export type GLDrawMode =
        | 'POINTS'
        | 'LINE_STRIP'
        | 'LINE_LOOP'
        | 'LINES'
        | 'TRIANGLE_STRIP'
        | 'TRIANGLE_FAN'
        | 'TRIANGLES'

export type GLDrawType = 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT' | 'UNSIGNED_INT'

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
        vs: string | X
        fs: string | X
        vert: string | X
        frag: string | X
        vertex: string | X
        fragment: string | X

        /**
         * for webgl
         */
        int: PrecisionMode
        float: PrecisionMode
        sampler2D: PrecisionMode
        samplerCube: PrecisionMode
        lastActiveUnit: number

        /**
         * core state
         */
        gl: any
        pg: any
        el: any
        queue: Queue
        frame: Frame
        stride: Nested<number>
        location: Nested<any> // @TODO Nested<(key: string, value: number: number[], ibo: number[]) => number>
        activeUnit: Nested<number>
        default: any

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
