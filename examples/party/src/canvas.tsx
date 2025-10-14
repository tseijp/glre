import { useGL } from 'glre/src/react'
import usePartySocket from 'partysocket/react'
import { useMemo, useState } from 'react'
import { useDrag, useKey } from 'rege/react'
import { applySeasonalTransform, createCamera, createShader, createMeshes, createPlayer, dec, enc, face, findNearestColor, K, raycast, screenToWorldRay, loadColors } from './helpers'
import type { Atlas, Meshes, Dims, Hit } from './helpers'

export interface CanvasProps {
        size?: number
        dims?: Dims
        atlas?: Atlas
        meshes?: Meshes
        onReady?: () => void
        onSemanticVoxel?: (v: any) => void
        pages?: Array<{ atlas: Atlas; mesh: Meshes; region: { i: number; j: number; k: number } }>
        mutate?: (data?: any, opts?: any) => any
}

export const Canvas = ({ size = 16, dims = { size: [32, 16, 32], center: [16, 8, 16] }, onSemanticVoxel, pages }: CanvasProps) => {
        const [culturalWorld] = useState<any>(null)

        const camera = useMemo(() => createCamera(size, dims), [])
        const meshes = useMemo(() => createMeshes(camera), [])
        const shader = useMemo(() => createShader(camera, meshes), [])
        const player = useMemo(() => createPlayer(camera, meshes, shader), [])

        const gl = useGL({
                vert: shader.vert,
                frag: shader.frag,
                isDepth: true,
                isDebug: false,
                isWebGL: true,
                count: meshes.count,
                instanceCount: meshes.instanceCount,
                loop() {
                        player.step(gl)
                },
                resize() {
                        shader.updateCamera(gl.size)
                },
        })

        useMemo(() => {
                gl.queue(() => {
                        if (!pages || pages.length === 0) return
                        const acc = { pos: [0, 0, 0], scl: [0, 0, 0], cnt: 1 }
                        for (const p of pages) {
                                if (!p?.mesh?.cnt) continue
                                acc.pos.push(...p.mesh.pos)
                                acc.scl.push(...p.mesh.scl)
                                acc.cnt += p.mesh.cnt
                        }
                        meshes.applyChunks(gl, acc)
                        shader.updateAtlas(pages[0].atlas)
                })
        }, [pages])

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
                const _ = d.memo
                const ray = screenToWorldRay(d.value, gl.size, camera)
                const hit = raycast(ray, meshes)
                const near = hit ? [ray.origin[0] + ray.dir[0] * hit.near, ray.origin[1] + ray.dir[1] * hit.near, ray.origin[2] + ray.dir[2] * hit.near] : undefined

                shader.updateHover(hit, near)

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

        return (
                <div ref={key.ref} className="w-full h-full">
                        <div ref={drag.ref as any} className="w-full h-full">
                                <canvas ref={gl.ref} className="w-full h-full bg-gradient-to-b from-sky-200 to-green-100" />
                        </div>
                </div>
        )
}

export default Canvas
