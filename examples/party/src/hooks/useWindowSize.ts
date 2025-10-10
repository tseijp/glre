import { useState, useSyncExternalStore } from 'react'

const createWindowSize = () => {
        let w = 800
        let update = () => {}
        const resize = () => {
                w = window.innerWidth
                update()
        }
        const get = () => w
        const sub = (_update = () => {}) => {
                update = _update
                window.addEventListener('resize', resize)
                return () => {
                        window.removeEventListener('resize', resize)
                }
        }
        if (typeof window !== 'undefined') w = window.innerWidth
        return { sub, get }
}

export const useWindowSize = () => {
        const [{ sub, get }] = useState(createWindowSize)
        return useSyncExternalStore(sub, get)
}
