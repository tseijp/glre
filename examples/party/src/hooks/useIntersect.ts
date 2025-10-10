import { useState } from 'react'
import { useCallback } from './useCallback'

const createIntersect = <El extends Element>(onEnter: (entry: IntersectionObserverEntry) => void) => {
        let target: El | null
        const io = new IntersectionObserver((entries) => {
                for (const e of entries) onEnter(e)
        })
        return (el: El | null) => {
                if (el) io.observe(el)
                else io.disconnect()
                target = el
        }
}

export const useIntersect = <El extends Element>(onEnter: (entry: IntersectionObserverEntry) => void) => {
        const fun = useCallback(onEnter)
        const [ref] = useState(() => createIntersect<El>(fun))
        return ref
}
