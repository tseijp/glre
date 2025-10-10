import { useMemo, useRef } from 'react'

export const useCallback = <Ret, Args extends any[]>(fun: (...args: Args) => Ret) => {
        const cache = useRef(fun)
        cache.current = fun
        const memo = useMemo(() => {
                return (...args: Args) => cache.current(...args)
        }, [])
        return memo
}
