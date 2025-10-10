export * from './useCallback'
export * from './useIntersect'
export * from './useObserver'
export * from './useSearchParam'
export * from './useWindowSize'

export const on = (isActive?: boolean, className = '') => (isActive ? className : '')

export const q = (params: any, key: string, fallback: any = '') =>
        params?.get ? params.get(key) ?? fallback : params?.[key] ?? fallback
