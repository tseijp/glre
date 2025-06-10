import { node } from '.'
import { getCachedBool, getCachedInt, getCachedFloat } from './cache'
import type { NodeProxy } from './types'

// JavaScript値をノードに変換
export const convertToNode = (value: any): NodeProxy => {
        if (typeof value === 'boolean') {
                return getCachedBool(value)
        }

        if (typeof value === 'number') {
                if (Number.isInteger(value)) {
                        return getCachedInt(value)
                }
                return getCachedFloat(value)
        }

        if (Array.isArray(value)) {
                return convertArrayToNode(value)
        }

        if (value && typeof value === 'object') {
                return convertObjectToNode(value)
        }

        return node('float', 0)
}

// 配列をベクトル/行列ノードに変換
const convertArrayToNode = (array: number[]): NodeProxy => {
        const len = array.length
        if (len === 2) return node('vec2', array)
        if (len === 3) return node('vec3', array)
        if (len === 4) return node('vec4', array)
        if (len === 9) return node('mat3', array)
        if (len === 16) return node('mat4', array)

        return node('float', array[0] || 0)
}

// オブジェクトをノードに変換
const convertObjectToNode = (obj: any): NodeProxy => {
        // カラーオブジェクトの検出
        if ('r' in obj && 'g' in obj && 'b' in obj) {
                const values = [obj.r, obj.g, obj.b]
                if ('a' in obj) values.push(obj.a)
                return node('color', values)
        }

        // ベクトルライクオブジェクトの検出
        if ('x' in obj && 'y' in obj) {
                const values = [obj.x, obj.y]
                if ('z' in obj) values.push(obj.z)
                if ('w' in obj) values.push(obj.w)
                return convertArrayToNode(values)
        }

        return node('float', 0)
}

// 型変換関数
export const float = (value: any): NodeProxy => {
        if (typeof value === 'number') return getCachedFloat(value)
        return node('float', Number(value) || 0)
}

export const int = (value: any): NodeProxy => {
        if (typeof value === 'number' && Number.isInteger(value))
                return getCachedInt(value)
        return node('int', Math.floor(Number(value)) || 0)
}

export const bool = (value: any): NodeProxy => {
        return getCachedBool(Boolean(value))
}

export const vec2 = (x?: any, y?: any): NodeProxy => {
        if (x === undefined) return node('vec2', [0, 0])
        if (y === undefined) {
                if (Array.isArray(x)) return node('vec2', x.slice(0, 2))
                if (typeof x === 'object' && 'x' in x && 'y' in x) {
                        return node('vec2', [x.x, x.y])
                }
                return node('vec2', [Number(x) || 0, Number(x) || 0])
        }
        return node('vec2', [Number(x) || 0, Number(y) || 0])
}

export const vec3 = (x?: any, y?: any, z?: any): NodeProxy => {
        if (x === undefined) return node('vec3', [0, 0, 0])
        if (y === undefined) {
                if (Array.isArray(x)) return node('vec3', x.slice(0, 3))
                if (typeof x === 'object' && 'x' in x && 'y' in x && 'z' in x) {
                        return node('vec3', [x.x, x.y, x.z])
                }
                return node('vec3', [
                        Number(x) || 0,
                        Number(x) || 0,
                        Number(x) || 0,
                ])
        }
        if (z === undefined) {
                return node('vec3', [Number(x) || 0, Number(y) || 0, 0])
        }
        return node('vec3', [Number(x) || 0, Number(y) || 0, Number(z) || 0])
}

export const vec4 = (x?: any, y?: any, z?: any, w?: any): NodeProxy => {
        if (x === undefined) return node('vec4', [0, 0, 0, 1])
        if (y === undefined) {
                if (Array.isArray(x)) return node('vec4', x.slice(0, 4))
                if (
                        typeof x === 'object' &&
                        'x' in x &&
                        'y' in x &&
                        'z' in x &&
                        'w' in x
                ) {
                        return node('vec4', [x.x, x.y, x.z, x.w])
                }
                return node('vec4', [
                        Number(x) || 0,
                        Number(x) || 0,
                        Number(x) || 0,
                        1,
                ])
        }
        return node('vec4', [
                Number(x) || 0,
                Number(y) || 0,
                Number(z) || 0,
                Number(w) || 1,
        ])
}

export const color = (r?: any, g?: any, b?: any): NodeProxy => {
        if (r === undefined) return node('color', [1, 1, 1])

        // 16進数カラーの処理
        if (typeof r === 'string' && r.startsWith('#')) {
                const hex = r.slice(1)
                const num = parseInt(hex, 16)
                return node('color', [
                        ((num >> 16) & 255) / 255,
                        ((num >> 8) & 255) / 255,
                        (num & 255) / 255,
                ])
        }

        // 数値カラーの処理
        if (typeof r === 'number' && g === undefined && b === undefined) {
                return node('color', [
                        ((r >> 16) & 255) / 255,
                        ((r >> 8) & 255) / 255,
                        (r & 255) / 255,
                ])
        }

        return vec3(r, g, b)
}
