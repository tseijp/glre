import { useEffect, useRef, useState } from 'react'

interface UseInViewOptions {
        threshold?: number
        rootMargin?: string
}

export const useInView = (options: UseInViewOptions = {}) => {
        const { threshold = 0.1, rootMargin = '50px 0px' } = options
        const [isInView, setIsInView] = useState(false)
        const ref = useRef<HTMLDivElement>(null)

        useEffect(() => {
                const element = ref.current
                if (!element || typeof IntersectionObserver === 'undefined') return

                const observer = new IntersectionObserver(
                        ([entry]) => {
                                const inView = entry.isIntersecting
                                setIsInView(inView)
                        },
                        { threshold, rootMargin }
                )

                observer.observe(element)

                return () => {
                        observer.unobserve(element)
                }
        }, [threshold, rootMargin])

        return [ref, isInView] as const
}
