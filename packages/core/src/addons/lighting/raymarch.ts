import { Fn, Vec2, Vec3, Float, Mat4, vec3, vec4, float, Loop, If, Break, int } from '../../node'
import { lookAtViewBasic } from '../space/lookAtView'
import { toMat3 } from '../math/toMat3'
import { sphereSDFRadius } from '../sdf/sphereSDF'
import { boxSDFSize } from '../sdf/boxSDF'

export const raymarchModelPosition = Fn(([st]: [Vec2]) => {
        const fov = float(1).div((60).mul(0.01745329252).mul(0.5).tan()).toVar()
        return st.mul(2).sub(1).toVec3().mul(vec3(1, 1, fov)).normalize()
}).setLayout({
        name: 'raymarchModelPosition',
        type: 'vec3',
        inputs: [{ name: 'st', type: 'vec2' }],
})

export const sceneMap = Fn(([p]: [Vec3]) => {
        const sphere1 = sphereSDFRadius(p.sub(vec3(-0.5, 0, 0)), float(0.3)).toVar()
        const sphere2 = sphereSDFRadius(p.sub(vec3(0.5, 0, 0)), float(0.25)).toVar()
        const box1 = boxSDFSize(p.sub(vec3(0, -0.5, 0)), vec3(0.8, 0.1, 0.8)).toVar()
        return sphere1.min(sphere2).min(box1)
}).setLayout({
        name: 'sceneMap',
        type: 'float',
        inputs: [{ name: 'p', type: 'vec3' }],
})

export const raymarchCast = Fn(([rayOrigin, rayDirection]: [Vec3, Vec3]) => {
        const maxDist = float(10).toVar()
        const epsilon = float(0.001).toVar()
        const maxSteps = 100

        let t = float(0).toVar()
        let dist = float(0).toVar()

        Loop(int(maxSteps), () => {
                const pos = rayOrigin.add(rayDirection.mul(t)).toVar()
                dist.assign(sceneMap(pos))

                If(dist.lessThan(epsilon), () => {
                        Break()
                })

                If(t.greaterThan(maxDist), () => {
                        Break()
                })

                t.addAssign(dist)
        })

        return t
}).setLayout({
        name: 'raymarchCast',
        type: 'float',
        inputs: [
                { name: 'rayOrigin', type: 'vec3' },
                { name: 'rayDirection', type: 'vec3' },
        ],
})

export const raymarch = Fn(([viewMatrix, st]: [Mat4, Vec2]) => {
        const camera = viewMatrix[3].xyz.toVar()
        const viewMatrix3 = toMat3(viewMatrix).toVar()
        const rayDirection = viewMatrix3.mul(raymarchModelPosition(st)).toVar()
        const t = raymarchCast(camera, rayDirection).toVar()
        const color = vec3(0.1)
                .select(vec3(0.8), t.lessThan(float(10)))
                .toVar()
        return vec4(color, 1)
}).setLayout({
        name: 'raymarch',
        type: 'vec4',
        inputs: [
                { name: 'viewMatrix', type: 'mat4' },
                { name: 'st', type: 'vec2' },
        ],
})

export const raymarchBasic = Fn(([cameraPos, lookAtTarget, st]: [Vec3, Vec3, Vec2]) => {
        const viewMatrix = lookAtViewBasic(cameraPos, lookAtTarget).toVar()
        return raymarch(viewMatrix, st)
}).setLayout({
        name: 'raymarchBasic',
        type: 'vec4',
        inputs: [
                { name: 'cameraPos', type: 'vec3' },
                { name: 'lookAtTarget', type: 'vec3' },
                { name: 'st', type: 'vec2' },
        ],
})
