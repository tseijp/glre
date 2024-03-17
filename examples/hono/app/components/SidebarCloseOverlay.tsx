import { gsap } from 'gsap'
import { useRef } from 'react'
import { useSidebarOpen, useSidebarOpenEffect } from '../hooks/useSidebarOpen'

const SidebarCloseOverlay = () => {
        const [, setSidebarOpen] = useSidebarOpen()
        const ref = useRef<HTMLDivElement | null>(null)

        const handleClick = () => {
                setSidebarOpen(false)
        }

        useSidebarOpenEffect((isOpen: boolean) => {
                if (!ref.current) return
                ref.current.style.pointerEvents = isOpen ? 'auto' : 'none'
                const opacity = isOpen ? 0.5 : 0
                gsap.to(ref.current, { opacity, ease: 'Expo4.out' })
        })

        return (
                <span
                        ref={ref}
                        className="fixed z-10 inset-0 opacity-0 bg-white dark:bg-black pointer-events-none"
                        onClick={handleClick}
                />
        )
}

export default SidebarCloseOverlay
