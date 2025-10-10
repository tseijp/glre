import { useState } from 'react'
import { useCallback } from './useCallback'

const createObserver = <El extends HTMLElement>(fun: (rect: DOMRect) => void) => {
        let target: El | null
        const ro = new ResizeObserver(() => {
                if (!target) return
                const rect = target.getBoundingClientRect()
                fun(rect)
        })
        return (el: El | null) => {
                target = el
                if (el) ro.observe(el)
        }
}

export const useObserver = <El extends HTMLElement>(fun: (rect: DOMRect) => void) => {
        const cache = useCallback(fun)
        const [ref] = useState(() => createObserver<El>(cache))
        return ref
}
