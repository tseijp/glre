import { createGL } from 'glre'
import { useOnce } from 'reev/react'
import { DefaultFragmentShader } from '../constants'
import { resizeGL, mountGL, cleanGL, drawGL } from '../utils'

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

const Viewport = (_props: ViewportProps) => {
        // const { fragmentShader } = props
        // eslint-disable-next-line
        const gl = useOnce(() => {
                return createGLImpl(DefaultFragmentShader)
        })

        return <canvas ref={gl.ref} color="red" className="rounded" />
}

export default Viewport
