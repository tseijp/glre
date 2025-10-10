import { useGL } from 'glre/src/react'
import { float, uv, vec3, vec4 } from 'glre/src/node'

export const Canvas = () => {
        const gl = useGL({
                fragment: vec4(vec3(float(0.3).mix(0.6, uv.y)), 1),
        })
        return <canvas ref={gl.ref} className="w-full h-full" />
}

export default Canvas
