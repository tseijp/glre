export const is = {
        arr: Array.isArray,
        bol: (a: unknown): a is boolean => typeof a === 'boolean',
        str: (a: unknown): a is string => typeof a === 'string',
        num: (a: unknown): a is number => typeof a === 'number',
        int: (a: unknown): a is number => Number.isInteger(a),
        fun: (a: unknown): a is Function => typeof a === 'function',
        und: (a: unknown): a is undefined => typeof a === 'undefined',
        nul: (a: unknown): a is null => a === null,
        set: (a: unknown): a is Set<unknown> => a instanceof Set,
        map: (a: unknown): a is Map<unknown, unknown> => a instanceof Map,
        obj: (a: unknown): a is object => !!a && a.constructor.name === 'Object',
        nan: (a: unknown): a is number => typeof a === 'number' && Number.isNaN(a),
}

/**
 * each
 */
type EachFn<Value, Key, This> = (this: This, value: Value, key: Key) => void
type Eachable<Value = any, Key = any, This = any> = {
        forEach(cb: EachFn<Value, Key, This>, ctx?: This): void
}

export const each = <Value, Key, This>(obj: Eachable<Value, Key, This>, fn: EachFn<Value, Key, This>) => obj.forEach(fn)

export const flush = <Value extends Function, Key, This>(obj: Eachable<Value, Key, This>, ...args: any[]) => {
        each(obj, (f) => f(...args))
}

export const isFloat32 = (value: unknown): value is Float32Array => {
        return value instanceof Float32Array
}

const loadingImage = (src: string, fun: (el: HTMLImageElement) => void) => {
        const el = new Image()
        Object.assign(el, { src, crossOrigin: 'anonymous' })
        el.decode().then(() => fun(el))
}

const loadingVideo = (src: string, fun: (source: HTMLVideoElement) => void) => {
        const el = document.createElement('video')
        Object.assign(el, { src, loop: true, muted: true, crossOrigin: 'anonymous' })
        el.load()
        el.play()
        el.addEventListener('canplay', fun.bind(null, el), { once: true })
}

export function loadingTexture(src: string, fun: (source: HTMLVideoElement, isVideo: true) => void): void

export function loadingTexture(src: string, fun: (source: HTMLImageElement, isVideo: false) => void): void

export function loadingTexture(src: string | HTMLImageElement | HTMLVideoElement, fun: Function) {
        if (!is.str(src)) return fun(src, src instanceof HTMLVideoElement)
        const isVideo = /\.(mp4|webm|ogg|avi|mov)$/i.test(src)
        const loader = isVideo ? loadingVideo : loadingImage
        loader(src, (el: HTMLImageElement | HTMLVideoElement) => {
                fun(el as HTMLVideoElement, isVideo)
        })
}
const { ceil, floor, max } = Math

const VALID = [1, 2, 3, 4, 9, 16]
const valid = (fn: (s: number) => number) => {
        let _check = (_a: number, _b: number) => true
        let _catch = ''
        const call = (s: number, error = console.warn, id = '') => {
                const ret = fn(s)
                if (!_check(s, ret)) error(`glre ${_catch} ${s}${id ? ` for '${id}'` : ''}`)
                return ret
        }
        call.check = (c = _check) => {
                _check = c
                return call
        }
        call.catch = (m = _catch) => {
                _catch = m
                return call
        }
        return call
}

export const arrayStride = valid((s) => ceil(s / 4) * 4)
        .check((s: number) => VALID.includes(s))
        .catch('uniform array: invalid element size')
export const alignStride = valid((s) => max(4, ceil((s * 4) / 4) * 4))
        .check((s) => 1 <= s && s <= 4)
        .catch('vertex buffer: invalid component size')
export const countStride = (len: number, count = 1, error = console.warn, id = '') =>
        valid((s) => floor(s / count))
                .check((_s, r) => VALID.includes(r))
                .catch(`attribute: invalid stride from ${len}/${count}`)(len, error, id)

export const arrayOffset = (n: number, at: number) => at * arrayStride(n)
export const bindingGroup = (i: number, n: number, base = 0) => base + floor(i / n)
export const bindingIndex = (i: number, n: number, s = 1) => (i % n) * s
export const alignTo256 = (n: number) => ceil(n / 256) * 256

export const GLSL_FS = /* cpp */ `
#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform vec2 iResolution;
void main() {
  fragColor = vec4(fract((gl_FragCoord.xy / iResolution)), 0.0, 1.0);
}
`

export const GLSL_VS = /* cpp */ `
#version 300 es
void main() {
  float x = float(gl_VertexID % 2) * 4.0 - 1.0;
  float y = float(gl_VertexID / 2) * 4.0 - 1.0;
  gl_Position = vec4(x, y, 1.0, 1.0);
}`

export const WGSL_VS = /* rust */ `
struct In { @builtin(vertex_index) vertex_index: u32 }
struct Out { @builtin(position) position: vec4f }
@vertex
fn main(in: In) -> Out {
  var out: Out;
  var x = f32(in.vertex_index % 2) * 4.0 - 1.0;
  var y = f32(in.vertex_index / 2) * 4.0 - 1.0;
  out.position = vec4f(x, y, 1.0, 1.0);
  return out;
}
`.trim()

export const WGSL_FS = /* rust */ `
struct Out { @builtin(position) position: vec4f }
@group(0) @binding(0) var<uniform> iResolution: vec2f;
@fragment
fn main(out: Out) -> @location(0) vec4f {
  return vec4f(fract((out.position.xy / iResolution)), 0.0, 1.0);
}
`
