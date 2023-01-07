/**
 * ref: https://stackoverflow.com/questions/52489261/typescript-can-i-define-an-n-length-tuple-type
 */
import type { Frame, Fun } from 'refr'
import type { Nested, Event } from 'reev'

export type Uniform = number | number[]

export type Attribute = number[]

export type Attributes = Record<string, Attribute>

export type Uniforms = Record<string, Uniform>

export interface GL {
        (shader: string): GL
        /**
         * initial value
         */
        id: string
        size: [number, number]
        mouse: [number, number]
        count: number
        frag: string
        vert: string
        lastActiveUnit: number
        /**
         * core state
         */
        gl: any
        pg: any
        el: any
        event: Event
        frame: Frame
        stride: Nested<number>
        location: Nested<any>
        activeUnit: Nested<number>
        uniformType: Nested<string>
        /**
         * setter
         */
        setDpr(...args: any[]): GL
        setSize(...args: any[]): GL
        setFrame(frame: Fun): GL
        setMount(frame: Fun): GL
        setClean(frame: Fun): GL
        setUniform(key: string, value: Uniform): GL
        setAttribute(key: string, value: Attribute, iboValue?: Attribute): GL
        setTexture(key: string, value: string): GL
}

export interface GLConfig {
        id?: string
        size?: [number, number]
        mouse?: [number, number]
        count?: number
        frag?: string
        vert?: string
        fragShader?: string
        vertShader?: string
        lastActiveUnit?: number
}