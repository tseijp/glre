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

export const isServer = () => {
        return typeof window === 'undefined'
}

export const isWebGPUSupported = () => {
        if (isServer()) return false
        return 'gpu' in navigator
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
