import { Fn, Float, Mat4, mat4, vec4 } from '../../node'

export const orthographic = Fn(([l, r, b, t, n, f]: [Float, Float, Float, Float, Float, Float]): Mat4 => {
        const width = r.sub(l).toVar('width')
        const height = t.sub(b).toVar('height')
        const depth = f.sub(n).toVar('depth')

        return mat4(
                vec4(width.reciprocal().mul(2), 0, 0, 0),
                vec4(0, height.reciprocal().mul(2), 0, 0),
                vec4(0, 0, depth.reciprocal().mul(-2), 0),
                vec4(r.add(l).div(width).negate(), t.add(b).div(height).negate(), f.add(n).div(depth).negate(), 1)
        )
}).setLayout({
        name: 'orthographic',
        type: 'mat4',
        inputs: [
                { name: 'l', type: 'float' },
                { name: 'r', type: 'float' },
                { name: 'b', type: 'float' },
                { name: 't', type: 'float' },
                { name: 'n', type: 'float' },
                { name: 'f', type: 'float' },
        ],
})
