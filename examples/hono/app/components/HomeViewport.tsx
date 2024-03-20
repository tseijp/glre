import { gsap } from 'gsap'
import { createGL } from 'glre'
import { useOnce } from 'reev/react'
import { DefaultFragmentShader } from '../constants'
import { resizeGL, mountGL, cleanGL, drawGL } from '../utils'
import Canvas from './Canvas'
import { useRef } from 'react'

interface ViewportProps {
        event?: any
        children?: React.ReactNode
        fragmentShader?: string
}

const createGLImpl = (fs = '') => {
        const ref = (el: HTMLCanvasElement | null) => {
                if (el) {
                        gl.el = el
                        resizeGL(gl)
                        mountGL(gl)
                        drawGL(gl)
                } else {
                        cleanGL(gl)
                }
        }

        const gl = createGL({ fs })

        gl.ref = ref

        return gl
}

const HomeViewport = (props: ViewportProps) => {
        const { children } = props
        const ref = useRef<HTMLDivElement | null>(null)
        const tl = useOnce(() => gsap.timeline({ paused: true }))
        const gl = useOnce(() => {
                return createGLImpl(DefaultFragmentShader)
        })

        const handleEnter = (opacity: number) => () => {
                tl.clear()
                tl.to(ref.current, { opacity, ease: 'Expo4.out' })
                tl.play()
        }

        return (
                <div className="relative px-6 pb-24 max-w-lg w-full h-full">
                        <div ref={ref} className="flex h-12">
                                {children}
                        </div>
                        <Canvas
                                ref={gl.ref}
                                onPointerEnter={handleEnter(0.25)}
                                onPointerLeave={handleEnter(1)}
                        />
                        <div className="left-0 bottom-0 w-full h-6 border-b-2 dark:border-gray-950"></div>
                </div>
        )
}

export default HomeViewport
