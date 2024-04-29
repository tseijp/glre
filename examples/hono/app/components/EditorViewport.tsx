import React from 'react'
import { gsap } from 'gsap'
import { useRef } from 'react'
import { useOnce } from 'reev/react'

import Canvas from './Canvas'
import ErrorMessage from './ErrorMessage'

interface EditorViewportProps extends React.HTMLAttributes<HTMLDivElement> {
        children: React.ReactNode
        err: string
}

const EditorViewport = React.forwardRef<
        HTMLCanvasElement | null,
        EditorViewportProps
>((props, forwardedRef) => {
        const { children, err, ...other } = props
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
                <div className="px-6 pb-24 max-w-lg w-full h-full" {...other}>
                        <div
                                ref={ref}
                                className="flex justify-start items-center h-12 overflow-hidden"
                        >
                                {children}
                        </div>
                        <Canvas
                                ref={forwardedRef}
                                onPointerEnter={handleEnter(0.25)}
                                onPointerLeave={handleEnter(1)}
                        >
                                {err && <ErrorMessage>{err}</ErrorMessage>}
                        </Canvas>
                        <div className="left-0 bottom-0 w-full h-6 border-b-2 dark:border-gray-950" />
                </div>
        )
})

export default EditorViewport
