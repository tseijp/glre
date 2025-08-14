import { Fn, Float, Vec3, cross, dot, sign, sqrt, min, length } from '../../../node'
import { lengthSq } from '../../math/lengthSq'
import { TriangleType } from './triangle'

export const distanceSq = Fn(([tri, pos]: [TriangleType, Vec3]): Float => {
        const a = tri.a
        const b = tri.b
        const c = tri.c
        const v21 = b.sub(a)
        const p1 = pos.sub(a)
        const v32 = c.sub(b)
        const p2 = pos.sub(b)
        const v13 = a.sub(c)
        const p3 = pos.sub(c)
        const nor = cross(v21, v13)

        const s1 = sign(dot(cross(v21, nor), p1))
        const s2 = sign(dot(cross(v32, nor), p2))
        const s3 = sign(dot(cross(v13, nor), p3))
        const signSum = s1.add(s2).add(s3)

        const edge1 = lengthSq(v21.mul(dot(v21, p1).div(lengthSq(v21)).saturate()).sub(p1))
        const edge2 = lengthSq(v32.mul(dot(v32, p2).div(lengthSq(v32)).saturate()).sub(p2))
        const edge3 = lengthSq(v13.mul(dot(v13, p3).div(lengthSq(v13)).saturate()).sub(p3))
        const edgeDistance = min(min(edge1, edge2), edge3)

        const planeDistance = dot(nor, p1).mul(dot(nor, p1)).div(lengthSq(nor))

        return sqrt(edgeDistance.select(planeDistance as any, signSum.lessThan(2))) as Float
}).setLayout({
        name: 'distanceSq',
        type: 'float',
        inputs: [
                { name: 'tri', type: 'auto' },
                { name: 'pos', type: 'vec3' },
        ],
})
