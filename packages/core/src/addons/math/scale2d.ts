import { Fn, Float, Vec2, mat2, Mat2 } from '../../node'

export const scale2d = Fn(([s]: [Float]): Mat2 => {
        return mat2(s, 0, 0, s)
}).setLayout({
        name: 'scale2d',
        type: 'mat2',
        inputs: [{ name: 's', type: 'float' }],
})

export const scale2dVec = Fn(([s]: [Vec2]): Mat2 => {
        return mat2(s.x, 0, 0, s.y)
}).setLayout({
        name: 'scale2d',
        type: 'mat2',
        inputs: [{ name: 's', type: 'vec2' }],
})

export const scale2dXY = Fn(([x, y]: [Float, Float]): Mat2 => {
        return mat2(x, 0, 0, y)
}).setLayout({
        name: 'scale2d',
        type: 'mat2',
        inputs: [
                { name: 'x', type: 'float' },
                { name: 'y', type: 'float' },
        ],
})
