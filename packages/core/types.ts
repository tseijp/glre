import type { Queue } from 'refr/types' // @ts-ignore
import type { Nested, EventState } from 'reev/types'

export type Uniform = number | number[]

export type Attribute = number[]

export type Attributes = Record<string, Attribute>

export type Uniforms = Record<string, Uniform>

export type GL = EventState<{
        /**
         * initial value
         */
        id: string
        width: number
        height: number
        size: [number, number]
        mouse: [number, number]
        count: number
        vs: string
        fs: string
        vert: string
        frag: string
        vertex: string
        fragment: string
        varying: string
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
        frame: Queue
        target: any
        stride: Nested<number>
        // @TODO Nested<(key: string, value: number: number[], ibo: number[]) => number>
        location: Nested<any>
        activeUnit: Nested<number>
        default: any

        /**
         * events
         */
        ref?: any
        init(varying?: string[]): void
        mount(): void
        clean(): void
        render(): void
        mousemove(e: Event): void
        resize(e?: Event, width?: number, height?: number): void
        load(e?: Event, image?: HTMLImageElement): void

        /**
         * setter
         */
        uniform(key: string, value: Uniform): GL
        uniform(target: { [key: string]: Uniform }): GL
        texture(key: string, value: string): GL
        texture(target: { [key: string]: string }): GL
        attribute(key: string, value: Attribute, iboValue?: Attribute): GL
        attribute(target: { [key: string]: Attribute }): GL
        // config(key?: keyof GL, value?: GL[keyof GL]): GL
        // config(target?: Partial<GL>): GL

        /**
         * short hands
         */
        clear(key?: GLClearMode): void
        viewport(size?: [number, number]): void
        drawArrays(key?: GLDrawMode): void
        drawElements(key?: GLDrawMode): void
}>

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
