import React from 'react'
import { gsap } from 'gsap'
import { useRef } from 'react'
import { useOnce } from 'reev/react'

import Canvas from './Canvas'

interface EditorViewportProps {
        children?: React.ReactNode
}

const EditorViewport = React.forwardRef<
        HTMLCanvasElement | null,
        EditorViewportProps
>((props, forwardedRef) => {
        const { children } = props
        const ref = useRef<HTMLDivElement | null>(null)
        const tl = useOnce(() => gsap.timeline({ paused: true }))

        const handleEnter = (opacity: number) => () => {
                tl.clear()
                tl.to(ref.current, {
                        opacity,
                        ease: 'Expo4.out',
                })
                tl.play()
        }
        return (
                <div className="px-6 pb-24 max-w-lg w-full h-full" {...props}>
                        <div ref={ref} className="flex h-12">
                                {children}
                        </div>
                        <Canvas
                                ref={forwardedRef}
                                onPointerEnter={handleEnter(0.25)}
                                onPointerLeave={handleEnter(1)}
                        />
                        <div className="left-0 bottom-0 w-full h-6 border-b-2 dark:border-gray-950"></div>
                </div>
        )
})

export default EditorViewport
