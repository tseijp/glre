import { Fn, Float, Vec2, Vec3, vec2, vec3, float, If } from '../../node'
import { random2Vec2 } from './random'
import { TAU } from '../math/const'

export const voronoi = Fn(([uv, time]: [Vec2, Float]): Vec3 => {
        const i_uv = uv.floor().toVar('i_uv')
        const f_uv = uv.fract().toVar('f_uv')
        const rta = vec3(0, 0, 10).toVar('rta')

        // Unroll nested loop: for j=-1 to 1, for i=-1 to 1
        // j=-1, i=-1
        const neighbor_m1m1 = vec2(-1, -1).toVar('neighbor_m1m1')
        const point_m1m1 = random2Vec2(i_uv.add(neighbor_m1m1)).toVar('point_m1m1')
        point_m1m1.assign(float(0.5).add(float(0.5).mul(time.add(point_m1m1.mul(TAU)).sin())))
        const diff_m1m1 = neighbor_m1m1.add(point_m1m1).sub(f_uv).toVar('diff_m1m1')
        const dist_m1m1 = diff_m1m1.length().toVar('dist_m1m1')
        If(dist_m1m1.lessThan(rta.z), () => {
                rta.xy.assign(point_m1m1)
                rta.z.assign(dist_m1m1)
        })

        // j=-1, i=0
        const neighbor_0m1 = vec2(0, -1).toVar('neighbor_0m1')
        const point_0m1 = random2Vec2(i_uv.add(neighbor_0m1)).toVar('point_0m1')
        point_0m1.assign(float(0.5).add(float(0.5).mul(time.add(point_0m1.mul(TAU)).sin())))
        const diff_0m1 = neighbor_0m1.add(point_0m1).sub(f_uv).toVar('diff_0m1')
        const dist_0m1 = diff_0m1.length().toVar('dist_0m1')
        If(dist_0m1.lessThan(rta.z), () => {
                rta.xy.assign(point_0m1)
                rta.z.assign(dist_0m1)
        })

        // j=-1, i=1
        const neighbor_1m1 = vec2(1, -1).toVar('neighbor_1m1')
        const point_1m1 = random2Vec2(i_uv.add(neighbor_1m1)).toVar('point_1m1')
        point_1m1.assign(float(0.5).add(float(0.5).mul(time.add(point_1m1.mul(TAU)).sin())))
        const diff_1m1 = neighbor_1m1.add(point_1m1).sub(f_uv).toVar('diff_1m1')
        const dist_1m1 = diff_1m1.length().toVar('dist_1m1')
        If(dist_1m1.lessThan(rta.z), () => {
                rta.xy.assign(point_1m1)
                rta.z.assign(dist_1m1)
        })

        // j=0, i=-1
        const neighbor_m10 = vec2(-1, 0).toVar('neighbor_m10')
        const point_m10 = random2Vec2(i_uv.add(neighbor_m10)).toVar('point_m10')
        point_m10.assign(float(0.5).add(float(0.5).mul(time.add(point_m10.mul(TAU)).sin())))
        const diff_m10 = neighbor_m10.add(point_m10).sub(f_uv).toVar('diff_m10')
        const dist_m10 = diff_m10.length().toVar('dist_m10')
        If(dist_m10.lessThan(rta.z), () => {
                rta.xy.assign(point_m10)
                rta.z.assign(dist_m10)
        })

        // j=0, i=0
        const neighbor_00 = vec2(0, 0).toVar('neighbor_00')
        const point_00 = random2Vec2(i_uv.add(neighbor_00)).toVar('point_00')
        point_00.assign(float(0.5).add(float(0.5).mul(time.add(point_00.mul(TAU)).sin())))
        const diff_00 = neighbor_00.add(point_00).sub(f_uv).toVar('diff_00')
        const dist_00 = diff_00.length().toVar('dist_00')
        If(dist_00.lessThan(rta.z), () => {
                rta.xy.assign(point_00)
                rta.z.assign(dist_00)
        })

        // j=0, i=1
        const neighbor_10 = vec2(1, 0).toVar('neighbor_10')
        const point_10 = random2Vec2(i_uv.add(neighbor_10)).toVar('point_10')
        point_10.assign(float(0.5).add(float(0.5).mul(time.add(point_10.mul(TAU)).sin())))
        const diff_10 = neighbor_10.add(point_10).sub(f_uv).toVar('diff_10')
        const dist_10 = diff_10.length().toVar('dist_10')
        If(dist_10.lessThan(rta.z), () => {
                rta.xy.assign(point_10)
                rta.z.assign(dist_10)
        })

        // j=1, i=-1
        const neighbor_m11 = vec2(-1, 1).toVar('neighbor_m11')
        const point_m11 = random2Vec2(i_uv.add(neighbor_m11)).toVar('point_m11')
        point_m11.assign(float(0.5).add(float(0.5).mul(time.add(point_m11.mul(TAU)).sin())))
        const diff_m11 = neighbor_m11.add(point_m11).sub(f_uv).toVar('diff_m11')
        const dist_m11 = diff_m11.length().toVar('dist_m11')
        If(dist_m11.lessThan(rta.z), () => {
                rta.xy.assign(point_m11)
                rta.z.assign(dist_m11)
        })

        // j=1, i=0
        const neighbor_01 = vec2(0, 1).toVar('neighbor_01')
        const point_01 = random2Vec2(i_uv.add(neighbor_01)).toVar('point_01')
        point_01.assign(float(0.5).add(float(0.5).mul(time.add(point_01.mul(TAU)).sin())))
        const diff_01 = neighbor_01.add(point_01).sub(f_uv).toVar('diff_01')
        const dist_01 = diff_01.length().toVar('dist_01')
        If(dist_01.lessThan(rta.z), () => {
                rta.xy.assign(point_01)
                rta.z.assign(dist_01)
        })

        // j=1, i=1
        const neighbor_11 = vec2(1, 1).toVar('neighbor_11')
        const point_11 = random2Vec2(i_uv.add(neighbor_11)).toVar('point_11')
        point_11.assign(float(0.5).add(float(0.5).mul(time.add(point_11.mul(TAU)).sin())))
        const diff_11 = neighbor_11.add(point_11).sub(f_uv).toVar('diff_11')
        const dist_11 = diff_11.length().toVar('dist_11')
        If(dist_11.lessThan(rta.z), () => {
                rta.xy.assign(point_11)
                rta.z.assign(dist_11)
        })

        return rta
}).setLayout({
        name: 'voronoi',
        type: 'vec3',
        inputs: [
                { name: 'uv', type: 'vec2' },
                { name: 'time', type: 'float' },
        ],
})

export const voronoiVec2 = Fn(([p]: [Vec2]): Vec3 => {
        return voronoi(p, float(0))
}).setLayout({
        name: 'voronoiVec2',
        type: 'vec3',
        inputs: [{ name: 'p', type: 'vec2' }],
})

export const voronoiVec3 = Fn(([p]: [Vec3]): Vec3 => {
        return voronoi(p.xy, p.z)
}).setLayout({
        name: 'voronoiVec3',
        type: 'vec3',
        inputs: [{ name: 'p', type: 'vec3' }],
})
