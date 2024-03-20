import { gsap } from 'gsap'
import { useRef } from 'react'
import { useOnce } from 'reev/react'
import { useSidebarOpen, useSidebarOpenEffect } from '../hooks/useSidebarOpen'

interface SidebarAroowButtonProps {
        Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
}

const SidebarAroowButton = (props: SidebarAroowButtonProps) => {
        const { Icon } = props
        const [, set] = useSidebarOpen()
        const enterTL = useOnce(() => gsap.timeline({ paused: true }))
        const clickTL = useOnce(() => gsap.timeline({ paused: true }))
        const iconRef = useRef<HTMLButtonElement | null>(null)
        const borderRef = useRef<HTMLButtonElement | null>(null)
        const buttonRef = useRef<HTMLButtonElement | null>(null)

        const handleEnter = (opacity: number) => () => {
                enterTL.clear()
                enterTL.to(borderRef.current, { opacity, ease: 'Expo4.out' })
                enterTL.play()
        }

        const handleClick = () => {
                set(true)
        }

        useSidebarOpenEffect((isOpen: Function) => {
                if (!buttonRef.current) return
                const rotateZ = isOpen ? 180 : 0
                const x = isOpen ? 320 : 0
                clickTL.clear()
                clickTL.to(iconRef.current, { x, rotateZ, ease: 'Expo4.out' })
                clickTL.play()
        })

        return (
                <button
                        ref={buttonRef}
                        onPointerEnter={handleEnter(1)}
                        onPointerLeave={handleEnter(0)}
                        onClick={handleClick}
                        className={`fixed m-3 w-12 h-12 flex justify-center items-center lg:hidden lg:pointer-events-none items-center justify-center gap-3 text-sm font-medium`}
                >
                        <span ref={iconRef} className="w-12 h-12 p-3">
                                <Icon />
                        </span>
                        <span
                                ref={borderRef}
                                className="absolute w-12 h-12 rounded opacity-0 border-2 dark:border-gray-950 text-gray-500 dark:text-gray-400"
                        />
                </button>
        )
}

export default SidebarAroowButton
