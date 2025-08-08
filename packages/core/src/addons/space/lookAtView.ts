import { Fn, Vec3, Float, Mat4, vec3 } from '../../node'
import { lookAt, lookAtRoll } from './lookAt'
import { translateMat3 } from './translate'

export const lookAtView = Fn(([position, target, up]: [Vec3, Vec3, Vec3]) => {
        const m = lookAt(position, target, up).toVar()
        return translateMat3(m, position)
}).setLayout({
        name: 'lookAtView',
        type: 'mat4',
        inputs: [
                { name: 'position', type: 'vec3' },
                { name: 'target', type: 'vec3' },
                { name: 'up', type: 'vec3' },
        ],
})

export const lookAtViewRoll = Fn(([position, target, roll]: [Vec3, Vec3, Float]) => {
        const m = lookAtRoll(position, target, roll).toVar()
        return translateMat3(m, position)
}).setLayout({
        name: 'lookAtViewRoll',
        type: 'mat4',
        inputs: [
                { name: 'position', type: 'vec3' },
                { name: 'target', type: 'vec3' },
                { name: 'roll', type: 'float' },
        ],
})

export const lookAtViewBasic = Fn(([position, target]: [Vec3, Vec3]) => {
        return lookAtView(position, target, vec3(0, 1, 0))
}).setLayout({
        name: 'lookAtViewBasic',
        type: 'mat4',
        inputs: [
                { name: 'position', type: 'vec3' },
                { name: 'target', type: 'vec3' },
        ],
})
