import { Fn, Float, Vec3, length, sign, dot } from '../../../node'
import { normal } from './normal'
import { closestPointWithNormal } from './closestPoint'
import { TriangleType } from './triangle'

export const signedDistanceWithNormal = Fn(([tri, triNormal, pos]: [TriangleType, Vec3, Vec3]): Float => {
        const nearest = closestPointWithNormal(tri, triNormal, pos).toVar('nearest')
        const delta = pos.sub(nearest).toVar('delta')
        const distance = length(delta).toVar('distance')
        return distance.mul(sign(dot(delta.div(distance), triNormal)))
}).setLayout({
        name: 'signedDistanceWithNormal',
        type: 'float',
        inputs: [
                { name: 'tri', type: 'auto' },
                { name: 'triNormal', type: 'vec3' },
                { name: 'pos', type: 'vec3' },
        ],
})

export const signedDistance = Fn(([tri, pos]: [TriangleType, Vec3]): Float => {
        const triNormal = normal(tri).toVar('triNormal')
        return signedDistanceWithNormal(tri, triNormal, pos)
}).setLayout({
        name: 'signedDistance',
        type: 'float',
        inputs: [
                { name: 'tri', type: 'auto' },
                { name: 'pos', type: 'vec3' },
        ],
})
