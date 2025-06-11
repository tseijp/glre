import { node } from '.'
import { is } from '../utils'
import { getCachedBool, getCachedInt, getCachedFloat } from './cache'
import type { X } from './types'

// JavaScript値をノードに変換
export const convertToNode = (x: unknown): X => {
        if (is.bol(x)) return getCachedBool(x)
        if (is.num(x)) {
                if (is.int(x)) return getCachedInt(x)
                return getCachedFloat(x)
        }
        if (is.arr(x)) return convertArrayToNode(x)
        if (is.obj(x)) return convertObjectToNode(x)
        return node('float', 0)
}

// 配列をベクトル/行列ノードに変換
const convertArrayToNode = (array: number[]): X => {
        const len = array.length
        if (len === 2) return node('vec2', array)
        if (len === 3) return node('vec3', array)
        if (len === 4) return node('vec4', array)
        if (len === 9) return node('mat3', array)
        if (len === 16) return node('mat4', array)
        return node('float', array[0])
}

// オブジェクトをノードに変換
const convertObjectToNode = (obj: any): X => {
        // カラーオブジェクトの検出
        if ('r' in obj && 'g' in obj && 'b' in obj) {
                const arr = [obj.r, obj.g, obj.b]
                if ('a' in obj) arr.push(obj.a)
                return node('color', arr)
        }
        // ベクトルライクオブジェクトの検出
        if ('x' in obj && 'y' in obj) {
                const arr = [obj.x, obj.y]
                if ('z' in obj) arr.push(obj.z)
                if ('w' in obj) arr.push(obj.w)
                return convertArrayToNode(arr)
        }
        return node('float', 0)
}

// 型変換関数
export const float = (x: unknown): X => {
        if (is.num(x)) return getCachedFloat(x)
        return node('float', Number(x))
}

export const int = (x: unknown): X => {
        if (is.num(x) && Number.isInteger(x)) return getCachedInt(x)
        return node('int', Math.floor(Number(x)))
}

export const bool = (x: unknown): X => {
        return getCachedBool(Boolean(x))
}

export const vec2 = (x?: any, y?: any): X => {
        if (is.und(x)) return node('vec2', [0, 0])
        if (is.und(y)) {
                if (is.arr(x)) return node('vec2', x.slice(0, 2))
                if (is.obj(x) && 'x' in x && 'y' in x)
                        return node('vec2', [x.x, x.y])
                return node('vec2', [Number(x), Number(x)])
        }
        return node('vec2', [Number(x), Number(y)])
}

export const vec3 = (x?: any, y?: any, z?: any): X => {
        if (is.und(x)) return node('vec3', [0, 0, 0])
        if (is.und(y)) {
                if (is.arr(x)) return node('vec3', x.slice(0, 3))
                if (is.obj(x) && 'x' in x && 'y' in x && 'z' in x)
                        return node('vec3', [x.x, x.y, x.z])
                return node('vec3', [Number(x), Number(x), Number(x)])
        }
        if (z === undefined) {
                return node('vec3', [Number(x), Number(y), 0])
        }
        return node('vec3', [Number(x), Number(y), Number(z)])
}

export const vec4 = (x?: any, y?: any, z?: any, w?: any): X => {
        if (is.und(x)) return node('vec4', [0, 0, 0, 1])
        if (is.und(y)) {
                if (is.arr(x)) return node('vec4', x.slice(0, 4))
                if (is.obj(x) && 'x' in x && 'y' in x && 'z' in x && 'w' in x)
                        return node('vec4', [x.x, x.y, x.z, x.w])
                return node('vec4', [Number(x), Number(x), Number(x), 1])
        }
        return node('vec4', [Number(x), Number(y), Number(z), Number(w)])
}

export const color = (r?: any, g?: any, b?: any): X => {
        if (r === undefined) return node('color', [1, 1, 1])

        // 16進数カラーの処理
        if (is.str(r) && r.startsWith('#')) {
                const hex = r.slice(1)
                const num = parseInt(hex, 16)
                return node('color', [
                        ((num >> 16) & 255) / 255,
                        ((num >> 8) & 255) / 255,
                        (num & 255) / 255,
                ])
        }

        // 数値カラーの処理
        if (is.num(r) && g === undefined && b === undefined) {
                return node('color', [
                        ((r >> 16) & 255) / 255,
                        ((r >> 8) & 255) / 255,
                        (r & 255) / 255,
                ])
        }

        return vec3(r, g, b)
}
