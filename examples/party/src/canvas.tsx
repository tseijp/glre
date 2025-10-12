import { useGL } from 'glre/src/react'
import usePartySocket from 'partysocket/react'
import { useMemo, useEffect, useState } from 'react'
import { useDrag, useKey } from 'rege/react'
import { applySeasonalTransform, createCamera, createDefaultCulturalWorld, createMeshes, createPlayer, dec, encOp, face, findNearestTraditionalColor, initAtlasWorld, K, raycast, screenToWorldRay } from './helpers'
import { createShader } from './helpers/shader'
import { createChunks, applyVoxelDataToChunks, gather } from './helpers/world/chunk'
import { createRegionConfig } from './helpers/world/chunk'
import { createVoxelProcessor } from './helpers/voxel/processor'
import { loadCesiumGltfModel, voxelizeCesiumData } from './helpers/tiles/loader'
import { selectTilesInRegion } from './helpers/tiles/traversal'
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

export const Canvas = (props: CanvasProps = {}) => {
        const { size = 16, dims = { size: [32, 16, 32], center: [16, 8, 16] }, region, onReady, isBuilding } = props
        const [isReady, setIsReady] = useState(false)
        const [culturalWorld, setCulturalWorld] = useState<any>(null)
        const [tilesChunks, setTilesChunks] = useState<any>(null)
        const [pendingMesh, setPendingMesh] = useState<Meshes | null>(null)

        const processor = useMemo(() => createVoxelProcessor(), [])

        // 初期化のみ。取得系は client.tsx 側で完結させる
        useEffect(() => {
                const init = async () => {
                        await loadTraditionalColors()

                        if (props.atlas && props.mesh) {
                                shader.updateAtlas(props.atlas as any)
                                setPendingMesh(props.mesh as any)
                        } else if (!props.atlas) {
                                await initAtlasWorld('/texture/world.png')
                        }

                        const world = await createDefaultCulturalWorld()
                        setCulturalWorld(world)
                        setIsReady(true)
                        onReady?.()
                }
                init()

                return () => {
                        processor.cleanup()
                }
        }, [props.atlas, region])

        const concatArrayBuffers = (arr: ArrayBuffer[]) => {
                if (!arr.length) return new ArrayBuffer(0)
                const len = arr.reduce((n, b) => n + b.byteLength, 0)
                const out = new Uint8Array(len)
                let o = 0
                for (const b of arr) {
                        out.set(new Uint8Array(b), o)
                        o += b.byteLength
                }
                return out.buffer
        }

        const camera = useMemo(() => createCamera(size, dims), [size, dims])
        const meshes = useMemo(() => {
                // Use tiles chunks if available, otherwise fall back to props
                const mesh = tilesChunks ? { pos: [], scl: [], cnt: 0, vertex: [], normal: [] } : props.mesh
                const m = createMeshes(camera, mesh as any)
                return m
        }, [camera, props.mesh, tilesChunks])
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
                        if (pendingMesh) {
                                meshes.applyChunks?.(gl, pendingMesh as any)
                                setPendingMesh(null)
                        }
                        player.step(gl)
                },
                resize() {
                        shader.updateCamera(gl.size)
                },
        })

        // 以降は描画/入力のみ
        const click = (hit?: Hit, near?: number[]) => {
                if (!hit || !culturalWorld) return
                const xyz = face(hit, meshes.pos, meshes.scl)
                if (!xyz) return

                // Apply cultural semantic encoding to placed voxels
                const currentSeason = culturalWorld.seasonalCycle
                const baseColor = 0xfef4f4 // 桜色 (cherry blossom)
                const culturalColor = applySeasonalTransform(baseColor, currentSeason, 0.8)
                const traditionalColor = findNearestTraditionalColor(culturalColor)

                const semanticVoxel = {
                        chunkId: 'cultural-world-default',
                        localX: xyz[0] % 16,
                        localY: xyz[1] % 16,
                        localZ: xyz[2] % 16,
                        primaryKanji: '桜',
                        secondaryKanji: '色',
                        rgbValue: traditionalColor.rgbValue,
                        alphaProperties: 255,
                        behavioralSeed: Math.floor(Math.random() * 256),
                }
                props.onSemanticVoxel?.(semanticVoxel)

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

        if (!isReady || isBuilding) {
                return (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-200 to-green-100">
                                <div className="text-center">
                                        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                        <div className="text-2xl font-bold text-gray-700 mb-2">文化的メタバース</div>
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
                <div ref={key.ref as any} className="w-full h-full">
                        <div ref={drag.ref as any} className="w-full h-full">
                                <canvas ref={gl.ref} className="w-full h-full bg-gradient-to-b from-sky-200 to-green-100" />
                        </div>
                </div>
        )
}

export default Canvas
