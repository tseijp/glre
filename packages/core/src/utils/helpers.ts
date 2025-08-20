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

/**
 * other
 */
export const replace = (x = '', from = '_', to = '/') => x.split(from).join(to)
export const ext = (src = '.pdf') => src.split('.').pop()?.toLowerCase() ?? ''
export const fig = (x = 0) => `${x}`.split('.')[1]?.length ?? 0
export const dig = (x = 0) => `${x}`.split('.')[0]?.length - (x < 0 ? 1 : 0)
export const sig = (value = 0, digit = -2) => {
        digit *= -1
        digit = Math.pow(10, digit)
        value *= digit
        value = Math.round(value)
        value /= digit
        return value
}

export const isFloat32 = (value: unknown): value is Float32Array => {
        return value instanceof Float32Array
}

const loadingImage = (src: string, fun: (source: HTMLImageElement) => void) => {
        const source = new Image()
        Object.assign(source, { src, crossOrigin: 'anonymous' })
        source.decode().then(() => fun(source))
}

const loadingVideo = (src: string, fun: (source: HTMLVideoElement) => void) => {
        const source = document.createElement('video')
        source.crossOrigin = 'anonymous'
        source.muted = true
        source.loop = true
        source.src = src
        source.load()
        source.play()
        source.addEventListener('canplay', fun.bind(null, source), { once: true })
}

export function loadingTexture(src: string, fun: (source: HTMLVideoElement, isVideo: true) => void): void

export function loadingTexture(src: string, fun: (source: HTMLImageElement, isVideo: false) => void): void

export function loadingTexture(src: string | HTMLImageElement | HTMLVideoElement, fun: Function) {
        if (!is.str(src)) return fun(src)
        const isVideo = /\.(mp4|webm|ogg|avi|mov)$/i.test(src)
        const loader = isVideo ? loadingVideo : loadingImage
        loader(src, (el: HTMLImageElement | HTMLVideoElement) => {
                fun(el as HTMLVideoElement, isVideo)
        })
}
const isValidStride = (stride: number) => [1, 2, 3, 4, 9, 16].includes(stride)

const calcStride = (arrayLength: number, count = 3) => {
        if (arrayLength % count === 0) return Math.floor(arrayLength / count)
        return -1
}

export const getStride = (arrayLength: number, count = 1, error = console.warn) => {
        const ret = calcStride(arrayLength, count)
        if (!isValidStride(ret))
                error(
                        `glre attribute error: Invalid attribute length ${arrayLength}. Must divide by vertex count (${count}) with valid stride (1,2,3,4,9,16)`
                )
        return ret
}

export const GLSL_FS = /* cpp */ `
#version 300 es
precision mediump float;
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
  gl_Position = vec4(x, y, 0.0, 1.0);
}`

export const WGSL_VS = /* rust */ `
struct In { @builtin(vertex_index) vertex_index: u32 }
struct Out { @builtin(position) position: vec4f }
@vertex
fn main(in: In) -> Out {
  var out: Out;
  var x = f32(in.vertex_index % 2) * 4.0 - 1.0;
  var y = f32(in.vertex_index / 2) * 4.0 - 1.0;
  out.position = vec4f(x, y, 0.0, 1.0);
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
