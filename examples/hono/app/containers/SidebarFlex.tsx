/**
 * w-80 is 320px
 */
import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useOnce } from 'reev/react'
import { useSidebarOpenEffect } from '../hooks/useSidebarOpen'
export interface SidebarFlexProps {
        children: React.ReactNode
}

const SidebarFlex = (props: SidebarFlexProps) => {
        const { children } = props
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
                        const isOpen = window.innerWidth > 768
                        handeOpen(isOpen)
                }
                window.addEventListener('resize', handleResize)
                return () => {
                        window.removeEventListener('resize', handleResize)
                }
        }, [])

        return (
                <div
                        ref={ref}
                        className="fixed md:relative z-10 w-80 h-screen z-20 flex flex-col border-r border-gray-200 dark:border-gray-800 shadow-sm backdrop-blur-sm -translate-x-full md:translate-x-0"
                >
                        <div className="flex-1 flex flex-col justify-between max-h-full">
                                {children}
                        </div>
                </div>
        )
}

export default SidebarFlex
