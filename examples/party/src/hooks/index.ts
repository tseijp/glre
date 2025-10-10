import { parseResponse } from 'hono/client'
import { StatusCode } from 'hono/utils/http-status'
import useSWR from 'swr'
import type { ClientResponse } from 'hono/client'
import type { Key } from 'swr'
export * from './useCallback'
export * from './useIntersect'
export * from './useObserver'
export * from './useSearchParam'
export * from './useWindowSize'

export const on = (isActive?: boolean, className = '') => (isActive ? className : '')

export const q = (params: any, key: string, fallback: any = '') =>
        params?.get ? params.get(key) ?? fallback : params?.[key] ?? fallback

const SWR_CONFIG = {
        keepPreviousData: true,
        revalidateOnFocus: false,
        revalidateIfStale: false,
}

export const useFetch = <T>(key: Key, fun: () => Promise<ClientResponse<T, StatusCode>>) =>
        useSWR(key, () => parseResponse(fun()) as T, { ...SWR_CONFIG, dedupingInterval: 60 * 60 * 1000 })
