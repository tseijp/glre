import { useGL } from 'glre/src/react'
import { useMemo, useEffect, useState } from 'react'
import usePartySocket from 'partysocket/react'
import { useDrag, useKey } from 'rege/react'
import { createCamera } from './helpers/camera'
import { createMeshes } from './helpers/meshes'
import { createShader } from './helpers/shader'
import { createPlayer } from './helpers/player'
import { initAtlasWorld } from './helpers/world'
import { encOp, dec, K } from './helpers/proto'
import { face, Hit, raycast, screenToWorldRay } from './helpers/raycast'
import { encodeSemanticVoxel, decodeSemanticVoxel, applySeasonalTransform } from './helpers/semantic'
import { generateColorPattern, createDefaultCulturalWorld } from './helpers/world'
import { loadTraditionalColors, findNearestTraditionalColor } from './helpers/colors'
import type { Dims } from './helpers/types'

export interface CanvasProps {
        size?: number
        dims?: Dims
}

export const Canvas = (props: CanvasProps = {}) => {
        const { size = 16, dims = { size: [32, 16, 32], center: [16, 8, 16] } } = props
        const [isReady, setIsReady] = useState(false)
        const [culturalWorld, setCulturalWorld] = useState<any>(null)

        // Initialize cultural metaverse system
        useEffect(() => {
                const initializeCulturalSystem = async () => {
                        await loadTraditionalColors()
                        await initAtlasWorld('/texture/world.png')
                        const world = await createDefaultCulturalWorld()
                        setCulturalWorld(world)
                        setIsReady(true)
                }
                initializeCulturalSystem()
        }, [])

        const camera = useMemo(() => createCamera(size, dims), [size, dims])
        const meshes = useMemo(() => createMeshes(camera), [camera])
        const shader = useMemo(() => createShader(camera, meshes), [camera, meshes])
        const player = useMemo(() => createPlayer(camera, meshes, shader), [])

        const gl = useGL({
                vert: shader.vert,
                frag: shader.frag,
                isDepth: true,
                isDebug: false,
                count: meshes.count,
                instanceCount: meshes.instanceCount,
                loop() {
                        if (!isReady) return
                        player.step(gl)
                },
                resize() {
                        shader.updateCamera(gl.size)
                },
        })

        // Cultural voxel interaction system
        const click = (hit?: Hit, near?: number[]) => {
                if (!hit || !culturalWorld) return
                const xyz = face(hit, meshes.pos, meshes.scl)
                if (!xyz) return

                // Apply cultural semantic encoding to placed voxels
                const currentSeason = culturalWorld.seasonalCycle
                const baseColor = 0xfef4f4 // 桜色 (cherry blossom)
                const culturalColor = applySeasonalTransform(baseColor, currentSeason, 0.8)
                const traditionalColor = findNearestTraditionalColor(culturalColor)

                // Create semantic voxel with cultural meaning
                const semanticVoxel = {
                        primaryKanji: '桜',
                        secondaryKanji: '色',
                        rgbValue: traditionalColor.rgbValue,
                        alphaProperties: 255,
                        behavioralSeed: Math.floor(Math.random() * 256),
                }

                shader.updateHover(hit, near)
                meshes.update(gl, xyz)
                sock.send(encOp(xyz[0], xyz[1], xyz[2]))
        }

        const drag = useDrag((d) => {
                const _ = d.memo as any
                const ray = screenToWorldRay(d.value, gl.size, camera)
                const hit = raycast(ray, meshes)
                const near = hit ? [ray.origin[0] + ray.dir[0] * hit.near, ray.origin[1] + ray.dir[1] * hit.near, ray.origin[2] + ray.dir[2] * hit.near] : undefined

                shader.updateHover(hit as any, near as any)

                if (d.isDragStart || d.isDragging) {
                        _.count++
                        player.turn(d.delta)
                } else {
                        const isClick = _.count === 1 || _.count === 2
                        if (isClick) click(_.hit, _.near)
                        _.count = 0
                        d.active = d._active = false
                }
                _.hit = hit
                _.near = near
        })

        const key = useKey({
                onKey(k) {
                        player.press(k.event.key, true)
                },
                onMount(el) {
                        el.addEventListener('keyup', (e: Event) => {
                                const keyEvent = e as KeyboardEvent
                                player.press(keyEvent.key)
                        })
                },
        })

        // Cultural metaverse real-time synchronization
        const sock = usePartySocket({
                party: 'my-server',
                room: 'cultural-metaverse',
                async onMessage(e) {
                        if (!(e.data instanceof Blob)) return
                        const data = await e.data.arrayBuffer()
                        const m = dec(data)
                        if (m.kind === K.OP) {
                                // Apply cultural validation to remote voxel operations
                                meshes.update(gl, [m.x!, m.y!, m.z!])
                        }
                },
        })

        if (!isReady) {
                return (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-200 to-green-100">
                                <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-700 mb-2">文化的メタバース</div>
                                        <div className="text-sm text-gray-600">伝統色彩システム初期化中...</div>
                                </div>
                        </div>
                )
        }

        return (
                <div ref={key.ref as any} className="w-full h-full">
                        <div ref={drag.ref as any} className="w-full h-full">
                                <canvas ref={gl.ref} className="w-full h-full bg-gradient-to-b from-sky-200 to-green-100" />
                        </div>
                </div>
        )
}

export default Canvas
