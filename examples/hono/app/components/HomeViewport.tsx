import { gsap } from 'gsap'
import { createGL } from 'glre'
import { useOnce } from 'reev/react'
import { resizeGL, mountGL, cleanGL, drawGL, resolve } from '../utils'
import Canvas from './Canvas'
import { useEffect, useRef } from 'react'

interface ViewportProps {
        event?: any
        content: string
        children?: React.ReactNode
}

const HomeViewport = (props: ViewportProps) => {
        const { children, content } = props
        const canvasRef = useRef<HTMLCanvasElement | null>(null)
        const ref = useRef<HTMLDivElement | null>(null)
        const tl = useOnce(() => gsap.timeline({ paused: true }))
        const gl = useOnce(createGL)

        const handleEnter = (opacity: number) => () => {
                tl.clear()
                tl.to(ref.current, { opacity, ease: 'Expo4.out' })
                tl.play()
        }

        useEffect(() => {
                ;(async () => {
                        try {
                                const el = canvasRef.current
                                if (!el) return

                                gl.el = el
                                gl.fs = await resolve(content)
                                resizeGL(gl)
                                mountGL(gl)
                                drawGL(gl)
                                el.addEventListener('mousemove', gl.mousemove)
                        } catch (error) {
                                console.warn('GL Error:', error)
                        }
                })()
                return () => {
                        const el = canvasRef.current
                        if (!el) return

                        el.removeEventListener('mousemove', gl.mousemove)
                        cleanGL(gl)
                }
        }, [content])

        return (
                <div className="px-6 pb-24 max-w-lg w-full h-full">
                        <div ref={ref} className="flex h-12">
                                {children}
                        </div>
                        <Canvas ref={canvasRef} onPointerEnter={handleEnter(0.25)} onPointerLeave={handleEnter(1)} />
                        <div className="left-0 bottom-0 w-full h-6 border-b-2 dark:border-gray-950"></div>
                </div>
        )
}

export default HomeViewport
