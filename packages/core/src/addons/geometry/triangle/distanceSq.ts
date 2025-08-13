import { Fn, Float, Vec3, cross, dot, sign, sqrt, min, length } from '../../../node'
import { lengthSq } from '../../math/lengthSq'

export const triangleDistanceSq = Fn(([a, b, c, pos]: [Vec3, Vec3, Vec3, Vec3]): Float => {
        const v21 = b.sub(a).toVar('v21')
        const p1 = pos.sub(a).toVar('p1')
        const v32 = c.sub(b).toVar('v32')
        const p2 = pos.sub(b).toVar('p2')
        const v13 = a.sub(c).toVar('v13')
        const p3 = pos.sub(c).toVar('p3')
        const nor = cross(v21, v13).toVar('nor')

        const s1 = sign(dot(cross(v21, nor), p1)).toVar('s1')
        const s2 = sign(dot(cross(v32, nor), p2)).toVar('s2')
        const s3 = sign(dot(cross(v13, nor), p3)).toVar('s3')
        const signSum = s1.add(s2).add(s3).toVar('signSum')

        const edge1 = lengthSq(v21.mul(dot(v21, p1).div(lengthSq(v21)).saturate()).sub(p1)).toVar('edge1')
        const edge2 = lengthSq(v32.mul(dot(v32, p2).div(lengthSq(v32)).saturate()).sub(p2)).toVar('edge2')
        const edge3 = lengthSq(v13.mul(dot(v13, p3).div(lengthSq(v13)).saturate()).sub(p3)).toVar('edge3')
        const edgeDistance = min(min(edge1, edge2), edge3).toVar('edgeDistance')

        const planeDistance = dot(nor, p1).mul(dot(nor, p1)).div(lengthSq(nor)).toVar('planeDistance')

        return sqrt(edgeDistance.select(planeDistance, signSum.lessThan(2)))
}).setLayout({
        name: 'triangleDistanceSq',
        type: 'float',
        inputs: [
                { name: 'a', type: 'vec3' },
                { name: 'b', type: 'vec3' },
                { name: 'c', type: 'vec3' },
                { name: 'pos', type: 'vec3' },
        ],
})

export const distanceSq = triangleDistanceSq
