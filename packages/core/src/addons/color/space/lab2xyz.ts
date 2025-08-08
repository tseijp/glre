import { Fn, Vec3, Vec4, float, select, vec3, vec4 } from '../../../node'

// CIE D65 white point (default)
const CIE_WHITE = vec3(0.95045592705, 1.0, 1.08905775076)

export const lab2xyz = Fn(([lab]: [Vec3]): Vec3 => {
        const fy = lab.x.add(16).div(116).toVar()
        const fx = lab.y.div(500).add(fy).toVar()
        const fz = fy.sub(lab.z.div(200)).toVar()

        const threshold = float(0.206897)
        const delta = float(16).div(116)
        const factor = float(7.787)

        const convertX = select(fx.pow(3), fx.sub(delta).div(factor), fx.greaterThan(threshold))
        const convertY = select(fy.pow(3), fy.sub(delta).div(factor), fy.greaterThan(threshold))
        const convertZ = select(fz.pow(3), fz.sub(delta).div(factor), fz.greaterThan(threshold))

        return CIE_WHITE.mul(100).mul(vec3(convertX, convertY, convertZ))
}).setLayout({
        name: 'lab2xyz',
        type: 'vec3',
        inputs: [{ name: 'lab', type: 'vec3' }],
})

export const lab2xyzVec4 = Fn(([lab]: [Vec4]): Vec4 => {
        return vec4(lab2xyz(lab.xyz), lab.w)
}).setLayout({
        name: 'lab2xyzVec4',
        type: 'vec4',
        inputs: [{ name: 'lab', type: 'vec4' }],
})
