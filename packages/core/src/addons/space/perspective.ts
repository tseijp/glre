import { Fn, Float, Mat4, mat4, tan, float } from '../../node'

export const perspective = Fn(([fov, aspect, near, far]: [Float, Float, Float, Float]): Mat4 => {
        const f = float(1)
                .div(tan(fov.div(2)))
                .toVar('f')
        const nf = float(1).div(near.sub(far)).toVar('nf')
        // prettier-ignore
        return mat4(
                f.div(aspect), 0, 0, 0,
                0, f, 0, 0,
                0, 0, far.add(near).mul(nf), -1,
                0, 0, float(2).mul(far).mul(near).mul(nf), 0
        )
}).setLayout({
        name: 'perspective',
        type: 'mat4',
        inputs: [
                { name: 'fov', type: 'float' },
                { name: 'aspect', type: 'float' },
                { name: 'near', type: 'float' },
                { name: 'far', type: 'float' },
        ],
})
