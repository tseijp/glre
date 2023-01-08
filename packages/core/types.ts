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
        stride: Nested<number> // @TODO Nested<(key: string, value: number: number[], ibo: number[]) => number>
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
        setTexture(key: string, value: string): GL
        setAttribute(key: string, value: Attribute, iboValue?: Attribute): GL
        setConfig<K extends keyof GLConfig>(key: K, value: GLConfig[K]): GL
//         setUniform: Durable<(
//                 key: string,
//                 value: Uniform,
//                 isMatrix: boolean
//         ) => GL>,
//         setTexture: Durable<(
//                 key: string,
//                 value: string,
//                 activeUnit: number
//         ) => GL>,
//         setAttribute: Durable<(
//                 key: string,
//                 value: Attribute,
//                 iboValue: Attribute
//         ) => GL>,
//         setConfig: Durable<<K extends keyof GLConfig>(
//                 key: K,
//                 value: GLConfig[K]
//         ) => GL>,
}

export interface GLConfig {
        id: string
        frag: string
        vert: string
        size: [number, number]
        mouse: [number, number]
        count: number
}