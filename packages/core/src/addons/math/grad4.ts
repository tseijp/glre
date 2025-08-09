import { Fn, Float, Vec4, vec4, vec3, float } from '../../node'

export const grad4 = Fn(([j, ip]: [Float, Vec4]): Vec4 => {
        const ones = vec4(1, 1, 1, -1).toVar('ones')
        const p = vec4(0).toVar('p')
        const s = vec4(0).toVar('s')
        p.xyz = vec3(j, j, j).mul(ip.xyz).fract().mul(7.0).floor().mul(ip.z).sub(1.0)
        p.w = float(1.5).sub(p.xyz.abs().dot(ones.xyz))
        s.assign(vec4(p.x.lessThan(0.0), p.y.lessThan(0.0), p.z.lessThan(0.0), p.w.lessThan(0.0)))
        p.xyz = p.xyz.add(s.xyz.mul(2.0).sub(1.0).mul(s.www))
        return p
}).setLayout({
        name: 'grad4',
        type: 'vec4',
        inputs: [
                { name: 'j', type: 'float' },
                { name: 'ip', type: 'vec4' },
        ],
})
