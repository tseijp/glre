import { useGL } from 'glre/src/react'

export const Canvas = () => {
        const gl = useGL()
        return <canvas ref={gl.ref} className="w-full h-full" />
}

export default Canvas
