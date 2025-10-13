import { useGL } from 'glre/src/react'
import usePartySocket from 'partysocket/react'
import { useMemo, useEffect, useState, useRef } from 'react'
import { useDrag, useKey } from 'rege/react'
import { applySeasonalTransform, createCamera, createShader, createDefaultWorld, createMeshes, createPlayer, dec, enc, face, findNearestColor, K, raycast, screenToWorldRay, loadColors } from './helpers'
import type { Atlas, Meshes, Dims, Hit } from './helpers'

export interface CanvasProps {
        size?: number
        dims?: Dims
        atlas?: Atlas
        mesh?: Meshes
        region?: {
                lat: number
                lng: number
                zoom?: number
        }
        onReady?: () => void
        isBuilding?: boolean
        onSemanticVoxel?: (v: any) => void
}

export const Canvas = ({ size = 16, dims = { size: [32, 16, 32], center: [16, 8, 16] }, region, onReady, isBuilding, atlas, mesh, onSemanticVoxel }: CanvasProps) => {
        const [culturalWorld, setWorld] = useState<any>(null)
        const pendingMeshRef = useRef<Meshes | null>(null)
        const [instCount, setInstCount] = useState<number>(mesh?.cnt || 1)

        useEffect(() => {
                const init = async () => {
                        await loadColors()
                        const world = await createDefaultWorld()
                        setWorld(world)
                        onReady?.()
                }
                init()
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
                instanceCount: instCount,
                loop() {
                        const next = pendingMeshRef.current
                        if (next) {
                                meshes.applyChunks?.(gl, next as any)
                                gl.instanceCount = (next as any).cnt || 1
                                setInstCount((next as any).cnt || 1)
                                pendingMeshRef.current = null
                        }
                        player.step(gl)
                },
                resize() {
                        shader.updateCamera(gl.size)
                },
        })

        useEffect(() => {
                if (!atlas) return
                shader.updateAtlas(atlas as any)
        }, [atlas, shader])
        useEffect(() => {
                if (!mesh) return
                pendingMeshRef.current = mesh as any
                setInstCount((mesh as any).cnt || 1)
        }, [mesh])

        const click = (hit?: Hit, near?: number[]) => {
                if (!hit || !culturalWorld) return
                const xyz = face(hit, meshes.pos, meshes.scl)
                if (!xyz) return

                // Apply cultural semantic encoding to placed voxels
                const currentSeason = culturalWorld.seasonalCycle
                const baseColor = 0xfef4f4 // 桜色 (cherry blossom)
                const culturalColor = applySeasonalTransform(baseColor, currentSeason, 0.8)
                const Color = findNearestColor(culturalColor)

                const semanticVoxel = {
                        chunkId: 'cultural-world-default',
                        localX: xyz[0] % 16,
                        localY: xyz[1] % 16,
                        localZ: xyz[2] % 16,
                        primaryKanji: '桜',
                        secondaryKanji: '色',
                        rgbValue: Color.rgbValue,
                        alphaProperties: 255,
                        behavioralSeed: Math.floor(Math.random() * 256),
                }
                onSemanticVoxel?.(semanticVoxel)

                shader.updateHover(hit, near)
                meshes.update(gl, xyz)
                sock.send(enc(xyz[0], xyz[1], xyz[2]))
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

        //  metaverse real-time synchronization
        const sock = usePartySocket({
                party: 'v1', // DO NOT CHANGE FROM "v1"
                room: 'my-room',
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

        if (isBuilding) {
                return (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-200 to-green-100">
                                <div className="text-center">
                                        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                        <div className="text-sm text-gray-600">{isBuilding ? '3D Tiles voxelization中...' : '伝統色彩システム初期化中...'}</div>
                                        {region && (
                                                <div className="text-xs text-gray-500 mt-2">
                                                        Region: {region.lat.toFixed(4)}, {region.lng.toFixed(4)}
                                                </div>
                                        )}
                                </div>
                        </div>
                )
        }
        return (
                <div ref={key.ref} className="w-full h-full">
                        <div ref={drag.ref as any} className="w-full h-full">
                                <canvas ref={gl.ref} className="w-full h-full bg-gradient-to-b from-sky-200 to-green-100" />
                        </div>
                </div>
        )
}

export default Canvas
