import { frame } from 'refr'
import { createGL } from 'glre'
import { useOnce } from 'reev/react'
import { DefaultFragmentShader } from '../constants'

interface ViewportProps {
        event?: any
        fragmentShader?: string
}

const mountGL = (gl: any) => {
        gl.gl = gl.el.getContext('webgl2')
        gl.init()
        frame.start()
        window.addEventListener('resize', gl.resize)
        gl.el.addEventListener('mousemove', gl.mousemove)

        gl.resize()
        gl.clear()
        gl.viewport()
        gl.drawArrays()
}

const cleanGL = (gl: any) => {
        window.removeEventListener('resize', gl.resize)
}

const createGLImpl = (fs?: string) => {
        const ref = (el: HTMLCanvasElement | null) => {
                if (el) {
                        gl.el = el
                        mountGL(gl)
                } else {
                        cleanGL(gl)
                }
        }
        const gl = createGL({
                fs,
                width: 540,
                height: 400,
        })

        gl.ref = ref

        return gl
}

const Viewport = (_props: ViewportProps) => {
        // const { fragmentShader } = props
        // eslint-disable-next-line
        const gl = useOnce(() => {
                return createGLImpl(DefaultFragmentShader)
        })

        return <canvas ref={gl.ref} width="540" height="400" color="red" />
}

export default Viewport
