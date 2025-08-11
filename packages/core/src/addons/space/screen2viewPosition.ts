import { Fn, Vec2, Vec4, Float, vec3, vec4, mat4, uniform } from '../../node'

const CAMERA_PROJECTION_MATRIX = uniform(mat4(), 'u_projectionMatrix')

export const screen2viewPosition = Fn(([screenPosition, depth, viewZ]: [Vec2, Float, Float]): Vec4 => {
        const clipW = CAMERA_PROJECTION_MATRIX[2][3]
                .toFloat()
                .mul(viewZ)
                .add(CAMERA_PROJECTION_MATRIX[3][3].toFloat())
                .toVar()
        const clipPosition = vec4(vec3(screenPosition, depth).sub(0.5).mul(2), 1).mul(clipW).toVar()
        return CAMERA_PROJECTION_MATRIX.inverse().mul(clipPosition)
}).setLayout({
        name: 'screen2viewPosition',
        type: 'vec4',
        inputs: [
                { name: 'screenPosition', type: 'vec2' },
                { name: 'depth', type: 'float' },
                { name: 'viewZ', type: 'float' },
        ],
})
