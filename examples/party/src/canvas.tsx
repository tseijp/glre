import { useGL } from 'glre/src/react'
import { useMemo } from 'react'
import { createCamera } from './helpers/camera'
import { createMeshes } from './helpers/meshes'
import { createShader } from './helpers/shader'
import type { Dims } from './helpers/types'

export interface CanvasProps {
        size?: number
        dims?: Dims
}

export const Canvas = (props: CanvasProps = {}) => {
        const { size = 16, dims = { size: [16, 16, 16], center: [8, 8, 8] } } = props
        
        // Create basic mesh data for fallback world texture
        const fallbackMesh = useMemo(() => ({
                pos: [0, 0, 0, 16, 0, 0, 0, 16, 0],
                scl: [16, 1, 16, 16, 1, 16, 16, 1, 16],
                cnt: 3,
                vertex: [],
                normal: []
        }), [])

        const fallbackAtlas = useMemo(() => ({
                src: '/texture/world.png',
                W: 4096,
                H: 4096,
                planeW: 1024,
                planeH: 1024,
                cols: 4
        }), [])

        const camera = useMemo(() => createCamera(size, dims), [size, dims])
        const meshes = useMemo(() => createMeshes(camera, fallbackMesh), [camera, fallbackMesh])
        const shader = useMemo(() => createShader(camera, meshes, fallbackAtlas), [camera, meshes, fallbackAtlas])

        const gl = useGL({
                vert: shader.vert,
                frag: shader.frag,
                isDepth: true,
                count: meshes.count,
                instanceCount: meshes.instanceCount,
                loop() {
                        // Basic rotation animation
                        camera.yaw = (camera.yaw + 0.3) % 360
                        camera.update(size, dims)
                        shader.updateCamera([gl.el?.width || 800, gl.el?.height || 600])
                },
                resize() {
                        shader.updateCamera([gl.el?.width || 800, gl.el?.height || 600])
                },
        })

        return <canvas ref={gl.ref} className="w-full h-full bg-gradient-to-b from-sky-200 to-green-100" />
}

export default Canvas