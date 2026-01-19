import { Fn, Float, Mat4, mat4, tan, float } from '../../node'

export const perspective = Fn(([fov, aspect, near, far]: [Float | number, Float | number, Float | number, Float | number]): Mat4 => {
        const f = float(1)
                .div(tan(float(fov).div(2)))
                .toVar('f')
        const nf = float(1).div(float(near).sub(far)).toVar('nf')
        // prettier-ignore
        return mat4(
                f.div(aspect), 0, 0, 0,
                0, f, 0, 0,
                0, 0, float(far).add(near).mul(nf), -1,
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
