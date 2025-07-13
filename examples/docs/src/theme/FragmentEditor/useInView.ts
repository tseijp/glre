import { useEffect, useRef, useState } from 'react'

interface UseInViewOptions {
        threshold?: number
        rootMargin?: string
        triggerOnce?: boolean
}

export const useInView = (options: UseInViewOptions = {}) => {
        const [isInView, setIsInView] = useState(false)
        const [hasBeenInView, setHasBeenInView] = useState(false)
        const ref = useRef<HTMLDivElement>(null)

        const { threshold = 0.1, rootMargin = '50px 0px', triggerOnce = false } = options

        useEffect(() => {
                const element = ref.current
                if (!element || typeof IntersectionObserver === 'undefined') {
                        return
                }

                const observer = new IntersectionObserver(
                        ([entry]) => {
                                const inView = entry.isIntersecting
                                setIsInView(inView)
                                
                                if (inView && !hasBeenInView) {
                                        setHasBeenInView(true)
                                }
                        },
                        { threshold, rootMargin }
                )

                observer.observe(element)

                return () => {
                        observer.unobserve(element)
                }
        }, [threshold, rootMargin, hasBeenInView])

        return {
                ref,
                isInView: triggerOnce ? hasBeenInView : isInView,
                hasBeenInView
        }
}