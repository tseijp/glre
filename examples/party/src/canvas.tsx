import { useGL } from 'glre/src/react'
import usePartySocket from 'partysocket/react'
import { useMemo } from 'react'
import { useDrag, useKey } from 'rege/react'
import { createShader, createMeshes, createPlayer, raycast, raycastRegion, screenToWorldRay, applyInstances } from './helpers'
import type { Atlas, Meshes, Dims, Region, Camera } from './helpers'

export interface CanvasProps {
        size?: number
        dims?: Dims
        atlas?: Atlas
        meshes?: Meshes
        camera: Camera
        onReady?: () => void
        onSemanticVoxel?: (v: any) => void
        regions?: Region[]
        mutate?: (data?: any, opts?: any) => any
        updateCamera?: (camera: any, mutate?: any) => any
}

export const Canvas = ({ size = 16, dims = { size: [32, 16, 32], center: [16, 8, 16] }, camera, onSemanticVoxel, regions, mutate, updateCamera }: CanvasProps) => {
        const meshes = useMemo(() => createMeshes(camera), [])
        const shader = useMemo(() => createShader(camera, meshes), [])
        const player = useMemo(() => createPlayer(camera, meshes, shader, updateCamera, mutate, regions), [])

        const gl = useGL({
                vert: shader.vert,
                frag: shader.frag,
                wireframe: true,
                isDepth: true,
                isDebug: false,
                isWebGL: true,
                count: meshes.count,
                instanceCount: meshes.cnt,
                loop() {
                        player.step(gl)
                },
                resize() {
                        shader.updateCamera(gl.size)
                },
        })

        useMemo(() => {
                gl.queue(() => {
                        if (!regions || regions.length === 0) return
                        meshes.applyRegions?.(regions)
                        const atlases = regions.slice(0, 8).map((r) => r.atlas)
                        const offs = regions.slice(0, 8).map((r) => [r.x, r.y, r.z])
                        if ((shader as any).updateAtlases) (shader as any).updateAtlases(atlases, offs)
                        else if (regions[0]) shader.updateAtlas(regions[0].atlas)
                        applyInstances(gl, meshes)
                })
        }, [regions])

        // @TODO FIX
        // const click = (hit?: Hit, near?: number[]) => {
        //         if (!hit || !culturalWorld) return
        //         const xyz = face(hit, meshes.pos, meshes.scl)
        //         if (!xyz) return
        //         // Apply cultural semantic encoding to placed voxels
        //         const currentSeason = culturalWorld.seasonalCycle
        //         const baseColor = 0xfef4f4 // 桜色 (cherry blossom)
        //         const culturalColor = applySeasonalTransform(baseColor, currentSeason, 0.8)
        //         const Color = findNearestColor(culturalColor)
        //         const semanticVoxel = {
        //                 localX: xyz[0] % 16,
        //                 localY: xyz[1] % 16,
        //                 localZ: xyz[2] % 16,
        //                 primaryKanji: '桜',
        //                 secondaryKanji: '色',
        //                 rgbValue: Color.rgbValue,
        //                 alphaProperties: 255,
        //                 behavioralSeed: Math.floor(Math.random() * 256),
        //         }
        //         onSemanticVoxel?.(semanticVoxel)
        //         shader.updateHover(hit, near)
        //         meshes.update(xyz)
        //         applyInstances(gl, meshes)
        //         sock.send(enc(xyz[0], xyz[1], xyz[2]))
        // }

        const drag = useDrag((d) => {
                const _ = d.memo
                const ray = screenToWorldRay(d.value, gl.size, camera)
                let hit = null as any
                if (regions && regions.length) {
                        const R = 16 * 16
                        const cx = camera.position[0]
                        const cz = camera.position[2]
                        let rid = -1
                        for (let r = 0; r < Math.min(regions.length, 8); r++) {
                                const rg = regions[r]
                                if (!rg) continue
                                const inX = rg.x <= cx && cx < rg.x + R
                                const inZ = rg.z <= cz && cz < rg.z + R
                                if (inX && inZ) {
                                        rid = r
                                        break
                                }
                        }
                        if (rid < 0) {
                                let md = Infinity
                                for (let r = 0; r < Math.min(regions.length, 8); r++) {
                                        const rg = regions[r]
                                        const dx = cx - (rg.x + R * 0.5)
                                        const dz = cz - (rg.z + R * 0.5)
                                        const d2 = dx * dx + dz * dz
                                        if (d2 < md) {
                                                md = d2
                                                rid = r
                                        }
                                }
                        }
                        if (rid >= 0) hit = raycastRegion(ray, meshes as any, rid, [regions[rid].x, regions[rid].y, regions[rid].z] as any)
                }
                if (!hit) hit = raycast(ray, meshes)
                const near = hit ? [ray.origin[0] + ray.dir[0] * hit.near, ray.origin[1] + ray.dir[1] * hit.near, ray.origin[2] + ray.dir[2] * hit.near] : undefined

                shader.updateHover(hit, near)

                if (d.isDragStart || d.isDragging) {
                        _.count++
                        player.turn(d.delta)
                } else {
                        // @TODO FIX
                        // const isClick = _.count === 1 || _.count === 2
                        // if (isClick) click(_.hit, _.near)
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
                        // @TODO FIX
                        // if (typeof e.data === 'string') {
                        //         const msg = JSON.parse(e.data)
                        //         if (msg?.t === 'atlas:ready') mutate?.()
                        //         return
                        // }
                        // if (e.data instanceof Blob) {
                        //         const data = await e.data.arrayBuffer()
                        //         const m = dec(data)
                        //         if (m.kind === K.OP) meshes.update(gl, [m.x!, m.y!, m.z!])
                        // }
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
