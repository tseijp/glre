import { gsap } from 'gsap'
import { useRef, useState } from 'react'
import { useOnce } from 'reev/react'
import { SIDEBAR_FLEX_WIDTH_PIXEL as x } from '../../constants'

interface SidebarAroowButtonProps {
        children: React.ReactNode
        sidebarRef: React.RefObject<HTMLDivElement>
}

const SidebarAroowButton = (props: SidebarAroowButtonProps) => {
        const { children, sidebarRef } = props
        const [isOpen, set] = useState(false)
        const cache = useOnce(() => ({ isOpen: false }))
        const enterTL = useOnce(() => gsap.timeline({ paused: true }))
        const clickTL = useOnce(() => gsap.timeline({ paused: true }))
        const iconRef = useRef<HTMLButtonElement>(null)
        const borderRef = useRef<HTMLButtonElement>(null)
        const buttonRef = useRef<HTMLButtonElement>(null)

        const handleEnter = (opacity: number) => () => {
                enterTL.clear()
                enterTL.to(borderRef.current, { opacity, ease: 'Expo4.out' })
                enterTL.play()
        }

        const handleClick = () => {
                if (!buttonRef.current) return
                const rz = cache.isOpen ? 0 : 180
                const mx = cache.isOpen ? -x : 0

                set((cache.isOpen = !cache.isOpen))
                clickTL.clear()
                clickTL.to(iconRef.current, { rotateZ: rz, ease: 'Expo4.out' })
                clickTL.to(sidebarRef.current, { x: mx, ease: 'Expo4.out' }, 0)
                clickTL.play()
        }

        return (
                <>
                        {/* icon */}
                        <button
                                ref={buttonRef}
                                onPointerEnter={handleEnter(1)}
                                onPointerLeave={handleEnter(0)}
                                onClick={handleClick}
                                className={`fixed w-12 h-12 flex justify-center items-center lg:hidden lg:pointer-events-none items-center justify-center m-8 gap-3 text-sm font-medium`}
                        >
                                <span ref={iconRef} className="w-12 h-12 p-3">
                                        {children}
                                </span>
                                {/* for border */}
                                <span
                                        ref={borderRef}
                                        className="absolute w-12 h-12 rounded opacity-0 border-2 dark:border-gray-950 text-gray-500 dark:text-gray-400"
                                />
                        </button>
                        {/* overlay */}
                        {isOpen && (
                                <span
                                        className="fixed inset-0 bg-black bg-opacity-50 z-10"
                                        onClick={handleClick}
                                />
                        )}
                </>
        )
}

export default SidebarAroowButton
