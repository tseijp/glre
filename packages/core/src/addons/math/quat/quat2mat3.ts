import { Fn, Vec4, Mat3, mat3, vec3, float } from '../../../node'

export const quat2mat3 = Fn(([q]: [Vec4]): Mat3 => {
        const qxx = q.x.mul(q.x).toVar('qxx')
        const qyy = q.y.mul(q.y).toVar('qyy')
        const qzz = q.z.mul(q.z).toVar('qzz')
        const qxz = q.x.mul(q.z).toVar('qxz')
        const qxy = q.x.mul(q.y).toVar('qxy')
        const qyw = q.y.mul(q.w).toVar('qyw')
        const qzw = q.z.mul(q.w).toVar('qzw')
        const qyz = q.y.mul(q.z).toVar('qyz')
        const qxw = q.x.mul(q.w).toVar('qxw')

        return mat3(
                vec3(float(1).sub(float(2).mul(qyy.add(qzz))), float(2).mul(qxy.sub(qzw)), float(2).mul(qxz.add(qyw))),
                vec3(float(2).mul(qxy.add(qzw)), float(1).sub(float(2).mul(qxx.add(qzz))), float(2).mul(qyz.sub(qxw))),
                vec3(float(2).mul(qxz.sub(qyw)), float(2).mul(qyz.add(qxw)), float(1).sub(float(2).mul(qxx.add(qyy))))
        )
}).setLayout({
        name: 'quat2mat3',
        type: 'mat3',
        inputs: [
                {
                        name: 'q',
                        type: 'vec4',
                },
        ],
})
