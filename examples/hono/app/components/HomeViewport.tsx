import { createGL } from 'glre'
import { useOnce } from 'reev/react'
import { DefaultFragmentShader } from '../constants'
import { resizeGL, mountGL, cleanGL, drawGL } from '../utils'
import Canvas from './Canvas'

interface ViewportProps {
        event?: any
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

const HomeViewport = (_props: ViewportProps) => {
        const gl = useOnce(() => {
                return createGLImpl(DefaultFragmentShader)
        })

        return (
                <div className="p-8 max-w-lg w-full h-full">
                        <Canvas ref={gl.ref} />
                </div>
        )
}

export default HomeViewport
