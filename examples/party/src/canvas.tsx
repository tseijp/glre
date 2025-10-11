import { useGL } from 'glre/src/react'
import { useMemo, useEffect, useState } from 'react'
import { createCamera } from './helpers/camera'
import { createMeshes } from './helpers/meshes'
import { createShader } from './helpers/shader'
import { encodeSemanticVoxel, decodeSemanticVoxel, rgbToTraditionalColor, validateColorHarmony } from './helpers/semantic'
import { generateColorPattern } from './helpers/world'
import type { Dims } from './helpers/types'

export interface CanvasProps {
        size?: number
        dims?: Dims
}

export const Canvas = (props: CanvasProps = {}) => {
        const { size = 16, dims = { size: [16, 16, 16], center: [8, 8, 8] } } = props
        const [culturalData, setCulturalData] = useState<any>(null)
        
        // Initialize cultural voxel system
        useEffect(() => {
                const initializeCulturalSystem = async () => {
                        // Generate semantic voxel data using traditional colors
                        const voxelData = []
                        for (let i = 0; i < 100; i++) {
                                const semanticVoxel = {
                                        primaryKanji: '桜',
                                        secondaryKanji: '色',
                                        rgbValue: 0xFEF4F4,
                                        alphaProperties: 255,
                                        behavioralSeed: Math.floor(Math.random() * 256)
                                }
                                const encoded = encodeSemanticVoxel(semanticVoxel)
                                const decoded = decodeSemanticVoxel(encoded)
                                voxelData.push({ encoded, decoded })
                        }
                        setCulturalData({ voxels: voxelData })
                }
                initializeCulturalSystem()
        }, [])
        
        // Create cultural mesh with traditional color validation
        const culturalMesh = useMemo(() => {
                const baseColors = [0xFEF4F4, 0xCD5C5C, 0xF8F8FF]
                const season = 'spring'
                const pos = []
                const scl = []
                
                for (let x = 0; x < 4; x++) {
                        for (let z = 0; z < 4; z++) {
                                const colorValue = generateColorPattern(baseColors, season, x, z)
                                const traditionalColor = rgbToTraditionalColor(
                                        (colorValue >>> 16) & 0xFF,
                                        (colorValue >>> 8) & 0xFF,
                                        colorValue & 0xFF
                                )
                                
                                pos.push(x * 4, 0, z * 4)
                                scl.push(4, 1, 4)
                        }
                }
                
                return {
                        pos,
                        scl,
                        cnt: pos.length / 3,
                        vertex: [],
                        normal: []
                }
        }, [culturalData])
        
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
        const meshes = useMemo(() => createMeshes(camera, culturalMesh || fallbackMesh), [camera, culturalMesh, fallbackMesh])
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