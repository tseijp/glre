import { vec3, mat4 } from 'gl-matrix'
import type { Camera } from './camera'
import type { Meshes } from '../types'

const MODE = 0 // 0 is creative
const TIME = 0.01
const GRAV = -0.06
const JUMP = 0.15
const TURN = 0.005
const MOVE = 0.09
const DASH = 2
const SLOW = 0.4
const PMAX = Math.PI / 2 - 0.01
const SIZE = vec3.fromValues(0.7, 1.8, 0.7)
const EYE = vec3.fromValues(0, 1.6 - SIZE[1] * 0.5, 0)

const _rot = mat4.create()
const _fwd = vec3.fromValues(0, 0, 1)

const faceDir = (out: vec3, y = 0, p = 0) => {
        mat4.identity(_rot)
        mat4.rotateY(_rot, _rot, y)
        if (p) mat4.rotateX(_rot, _rot, p)
        vec3.transformMat4(out, _fwd, _rot)
        return out
}

const _up = vec3.fromValues(0, 1, 0)
const _t0 = vec3.create()
const _t1 = vec3.create()

const moveDir = (out: vec3, dir: vec3, speed: number) => {
        vec3.cross(_t0, _up, out)
        vec3.scale(_t0, _t0, dir[0])
        vec3.scale(_t1, out, dir[2])
        vec3.add(out, _t0, _t1)
        vec3.scale(out, out, speed)
        return out
}

export const createPlayer = (camera: Camera, meshes: Meshes, shader: any) => {
        const pos = vec3.clone(camera.position)
        const vel = vec3.create()
        const dir = vec3.create()
        const state = { pos, vel, size: SIZE, isGround: false }
        let pitch = 0
        let speed = 1
        let yaw = 0
        let prev = performance.now()
        let time = prev
        let mode = MODE
        const tick = () => {
                time = performance.now()
                const dt = (time - prev) * TIME
                prev = time
                return dt
        }
        const setLook = () => {
                vec3.add(camera.position, pos, EYE)
                vec3.add(camera.target, pos, EYE)
                vec3.add(camera.target, pos, face)
        }
        const _jump = (isPress = false, dir = 1) => {
                if (mode && !state.isGround) return
                if (mode) vel[1] = JUMP
                else vel[1] = isPress ? JUMP * dir : 0
        }
        let face = vec3.create()
        let move = vec3.create()
        const step = (gl: any) => {
                const dt = tick()
                face = faceDir(move, yaw, 0)
                move = moveDir(move, dir, MOVE * speed)
                vel[0] = move[0]
                vel[2] = move[2]
                if (mode) vel[1] += GRAV * dt
                vec3.add(pos, pos, vel)
                // if (mode) collider(meshes.chunks, state)
                if (pos[1] < 0) pos[1] = 0
                face = faceDir(face, yaw, pitch)
                setLook()
                shader.updateCamera(gl.size)
                if (camera.needsUpdate) {
                        camera.needsUpdate = false
                }
        }
        let last = time
        const turn = (delta: number[]) => {
                yaw -= delta[0] * TURN
                pitch += delta[1] * TURN
                pitch = Math.min(pitch, PMAX)
                pitch = Math.max(pitch, -PMAX)
                faceDir(face, yaw, pitch)
                setLook()
                if (time - last < 100) return
                last = time
                camera.needsUpdate = true
        }
        const press = (k = '', isPress = false) => {
                k = k.toLowerCase()
                if (k === ' ') _jump(isPress, 1)
                if (k === 'w') dir[2] = isPress ? 1 : 0
                if (k === 's') dir[2] = isPress ? -1 : 0
                if (k === 'a') dir[0] = isPress ? 1 : 0
                if (k === 'd') dir[0] = isPress ? -1 : 0
                if (k === 'meta') speed = isPress ? DASH : 1
                if (k === 'control') speed = isPress ? DASH : 1
                if (k === 'shift') {
                        if (mode) speed = isPress ? SLOW : 1
                        else _jump(isPress, -1)
                }
                if (k === 'm' && isPress) mode = mode ? 0 : 1
                camera.needsUpdate = true
        }
        return { step, turn, press }
}
