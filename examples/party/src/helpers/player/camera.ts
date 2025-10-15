import { mat4, vec3 } from 'gl-matrix'
import { CHUNK, WORLD } from '../utils'
import type { Dims } from '../types'

const createProj = (out: mat4, camera: Camera, size: number[]) => {
        const aspect = size[0] / size[1]
        mat4.perspective(out, camera.fov, aspect, camera.near, camera.far)
        return out
}

const createView = (out: mat4, camera: Camera) => {
        const cp = vec3.fromValues(camera.position[0], camera.position[1], camera.position[2])
        const tg = vec3.fromValues(camera.target[0], camera.target[1], camera.target[2])
        const up = vec3.fromValues(0, 1, 0)
        mat4.lookAt(out, cp, tg, up)
        return out
}

export const computeCamera = (camera: Camera, size: number[]) => {
        createView(camera.V, camera)
        createProj(camera.P, camera, size)
        mat4.multiply(camera.VP, camera.P, camera.V)
        return Array.from(camera.VP)
}

export const createCamera = (size: number, dims: Dims) => {
        const x = WORLD[0] * 0.5
        const y = 10
        const z = WORLD[2] * 0.5
        const camera = {
                position: vec3.fromValues(x, y, z),
                target: vec3.fromValues(x, y, z + 10),
                near: 0.1,
                far: CHUNK * 16 * 16,
                fov: Math.PI / 4,
                V: mat4.create(),
                P: mat4.create(),
                VP: mat4.create(),
                yaw: 0,
                pitch: 0,
                needsUpdate: true,
                update(size: number, dims: { size: [number, number, number] }) {
                        const w = Math.max(1, Math.round(dims.size[0] || size))
                        const d = Math.max(1, Math.round(dims.size[1] || size))
                        const h = Math.max(1, Math.round(dims.size[2] || size))
                        const cx = w * 0.5
                        const cy = h * 0.5
                        const cz = d * 0.5
                        const pit = camera.pitch * 0.01
                        const yaw = camera.yaw * 0.01
                        const R = Math.max(w, h, d) * 1.6
                        const yoff = Math.max(2, h * 0.2)
                        camera.position[0] = cx + R * Math.cos(pit) * Math.sin(yaw)
                        camera.position[1] = cy + R * Math.sin(pit) + yoff
                        camera.position[2] = cz + R * Math.cos(pit) * Math.cos(yaw)
                        camera.target[0] = cx
                        camera.target[1] = cy
                        camera.target[2] = cz
                        camera.far = CHUNK * 16 * 16
                },
        }
        computeCamera(camera, [1280, 800])
        camera.update(size, dims)
        return camera
}

export type Camera = ReturnType<typeof createCamera>
