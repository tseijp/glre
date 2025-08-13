import { Fn, Float, Vec3, cross, dot, float, struct, vec3 } from '../../../node'
import { TriangleType } from './triangle'

export const Ray = struct({
        origin: vec3(),
        direction: vec3(),
})

export type RayType = ReturnType<typeof Ray>

export const triangleIntersect = Fn(([tri, rayOrigin, rayDir]: [TriangleType, Vec3, Vec3]): Float => {
        const v1v0 = tri.b.sub(tri.a).toVar('v1v0')
        const v2v0 = tri.c.sub(tri.a).toVar('v2v0')
        const rov0 = rayOrigin.sub(tri.a).toVar('rov0')
        const point = cross(v1v0, v2v0).toVar('point')
        const q = cross(rov0, rayDir).toVar('q')
        const d = float(1).div(dot(rayDir, point)).toVar('d')
        const u = d.mul(dot(q, v2v0).negate()).toVar('u')
        const v = d.mul(dot(q, v1v0)).toVar('v')
        const t = d.mul(dot(point, rov0).negate()).toVar('t')

        const isOutside = u
                .lessThan(0)
                .or(u.greaterThan(1))
                .or(v.lessThan(0))
                .or(u.add(v).greaterThan(1))
                .or(t.lessThan(0))
                .toVar('isOutside')

        return float(9999999.9).select(t, isOutside)
}).setLayout({
        name: 'triangleIntersect',
        type: 'float',
        inputs: [
                { name: 'tri', type: 'auto' },
                { name: 'rayOrigin', type: 'vec3' },
                { name: 'rayDir', type: 'vec3' },
        ],
})

export const triangleIntersectRay = Fn(([tri, ray]: [TriangleType, RayType]): Float => {
        return triangleIntersect(tri, ray.origin, ray.direction)
}).setLayout({
        name: 'triangleIntersectRay',
        type: 'float',
        inputs: [
                { name: 'tri', type: 'auto' },
                { name: 'ray', type: 'auto' },
        ],
})

export const intersect = triangleIntersect
