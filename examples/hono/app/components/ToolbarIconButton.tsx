import { gsap } from 'gsap'
import { useRef } from 'react'
import { useOnce } from 'reev/react'

interface ToolbarIconButtonProps {
        Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
        children: React.ReactNode
}

const ToolbarIconButton = (props: ToolbarIconButtonProps) => {
        const { Icon, children } = props
        const tl = useOnce(() => gsap.timeline({ paused: true }))
        const ref = useRef<HTMLButtonElement>(null)

        const handleHover = (opacity: number) => () => {
                if (!ref.current) return
                tl.clear()
                tl.to(ref.current, { opacity, ease: 'Expo4.out' })
                tl.play()
        }

        return (
                <button
                        className="flex justify-center align-center h-12 lg:mx-3 text-gray-500 dark:text-gray-400"
                        onPointerEnter={handleHover(1)}
                        onPointerLeave={handleHover(0)}
                >
                        <span className="w-12 h-12 p-3">
                                <Icon className="w-6 h-6" />
                        </span>
                        <span className="hidden lg:flex p-3 leading-6">
                                <span ref={ref} className="opacity-0">
                                        {children}
                                </span>
                        </span>
                </button>
        )
}

export default ToolbarIconButton
