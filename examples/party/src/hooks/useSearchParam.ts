import { useState, useSyncExternalStore } from 'react'

const createSearchParam = (key: string) => {
        const get = () => {
                if (typeof window === 'undefined') return ''
                return new URLSearchParams(window.location.search).get(key) ?? ''
        }
        const sub = (update = () => {}) => {
                window.addEventListener('popstate', update)
                return () => {
                        window.removeEventListener('popstate', update)
                }
        }
        return { sub, get }
}

export const useSearchParam = (key: string) => {
        const [{ sub, get }] = useState(() => createSearchParam(key))
        return useSyncExternalStore(sub, get)
}
