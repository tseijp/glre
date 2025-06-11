/**
 * w-80 is 320px
 */
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useOnce } from 'reev/react'
import { useSidebarOpenEffect } from '../hooks/useSidebarOpen'

export const useSidebarFlex = () => {
        const tl = useOnce(() => gsap.timeline({ paused: true }))
        const ref = useRef<HTMLDivElement | null>(null)

        const handeOpen = (isOpen: boolean) => {
                if (!ref.current) return
                const mx = isOpen ? 0 : -320
                tl.clear()
                tl.to(ref.current, { x: mx, ease: 'Expo4.out' })
                tl.play()
        }
        useSidebarOpenEffect((isOpen: boolean) => {
                handeOpen(isOpen)
        })

        useEffect(() => {
                const handleResize = () => {
                        if (!ref.current) return
                        const isOpen = window.innerWidth > 1024 // lg
                        handeOpen(isOpen)
                }
                window.addEventListener('resize', handleResize)
                return () => {
                        window.removeEventListener('resize', handleResize)
                }
        }, [])

        return ref
}
