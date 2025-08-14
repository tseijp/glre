import { Fn, Vec3, Mat4, mat3 } from '../../node'
import { rotate3dX, rotate3dY, rotate3dZ } from '../math'
import { translateMat3 } from './translate'

export const eulerView = Fn(([position, euler]: [Vec3, Vec3]): Mat4 => {
        const rotZ = rotate3dZ(euler.z)
        const rotX = rotate3dX(euler.x)
        const rotY = rotate3dY(euler.y)
        const identity = mat3(1).toVar('identity')
        const rotation = rotY.mul(rotX).mul(rotZ).mul(identity).toVar('rotation')
        return translateMat3(rotation, position)
}).setLayout({
        name: 'eulerView',
        type: 'mat4',
        inputs: [
                { name: 'position', type: 'vec3' },
                { name: 'euler', type: 'vec3' },
        ],
})
