import { Fn, Float, Mat4, Vec3, X, mat4 } from '../../node'

export const translate4d = Fn(([x, y, z]: [X | number, X | number | undefined, X | number | undefined]): Mat4 => {
        if (y === undefined && z === undefined) {
                const t = x as Vec3
                return mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, t.x, t.y, t.z, 1)
        } else {
                const tx = x as Float
                const ty = y as Float
                const tz = z as Float
                return mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1)
        }
}).setLayout({
        name: 'translate4d',
        type: 'mat4',
        inputs: [
                { name: 'x', type: 'auto' },
                { name: 'y', type: 'auto' },
                { name: 'z', type: 'auto' },
        ],
})
