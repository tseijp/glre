import { Fn, Vec3, Vec2, X, texture, float, vec3, int, Loop, If } from '../../node'
import { lookAtBasic } from './lookAt'

const DISPLACE_DEPTH = float(1).constant('DISPLACE_DEPTH')
const DISPLACE_PRECISION = float(0.01).constant('DISPLACE_PRECISION')
const DISPLACE_MAX_ITERATIONS = int(120).constant('DISPLACE_MAX_ITERATIONS')

export const displace = Fn(([tex, ro, rd]: [X, Vec3, Vec3]): Vec3 => {
        const dz = ro.z.sub(DISPLACE_DEPTH).toVar('dz')
        const t = dz.div(rd.z).toVar('t')
        const prev = vec3(ro.x.sub(rd.x.mul(t)), ro.y.sub(rd.y.mul(t)), ro.z.sub(rd.z.mul(t))).toVar('prev')
        const curr = prev.toVar('curr')
        const lastD = prev.z.toVar('lastD')
        const hmap = float(0).toVar('hmap')
        const df = float(0).toVar('df')

        Loop(DISPLACE_MAX_ITERATIONS, () => {
                prev.assign(curr)
                curr.assign(prev.add(rd.mul(DISPLACE_PRECISION)))
                hmap.assign(texture(tex, curr.xy.sub(0.5)).r)
                df.assign(curr.z.sub(hmap.mul(DISPLACE_DEPTH)))

                If(df.lessThan(0), () => {
                        const t = lastD.div(df.abs().add(lastD)).toVar('t')
                        return prev.add(t.mul(curr.sub(prev))).add(vec3(0.5, 0.5, 0))
                })

                lastD.assign(df)
        })

        return vec3(0, 0, 1)
}).setLayout({
        name: 'displace',
        type: 'vec3',
        inputs: [
                { name: 'tex', type: 'sampler2D' },
                { name: 'ro', type: 'vec3' },
                { name: 'rd', type: 'vec3' },
        ],
})

export const displaceUV = Fn(([tex, ro, uv]: [X, Vec3, Vec2]): Vec3 => {
        const rd = lookAtBasic(ro.negate())
                .mul(vec3(uv.sub(float(0.5)), 1).normalize())
                .toVar('rd')
        return displace(tex, ro, rd)
}).setLayout({
        name: 'displaceUV',
        type: 'vec3',
        inputs: [
                { name: 'tex', type: 'sampler2D' },
                { name: 'ro', type: 'vec3' },
                { name: 'uv', type: 'vec2' },
        ],
})
