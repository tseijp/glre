import { Fn, Vec2, Vec3, Vec4, Float, abs, distance, max, pow } from '../../node'

const DIST_MINKOWSKI_P = 2.0

export const distEuclidean = Fn(([a, b]: [Vec2 | Vec3 | Vec4, Vec2 | Vec3 | Vec4]): Float => {
        return distance(a, b)
}).setLayout({
        name: 'distEuclidean',
        type: 'float',
        inputs: [
                { name: 'a', type: 'auto' },
                { name: 'b', type: 'auto' },
        ],
})

export const distManhattan = Fn(([a, b]: [Vec2, Vec2]): Float => {
        return abs(a.x.sub(b.x)).add(abs(a.y.sub(b.y)))
}).setLayout({
        name: 'distManhattan',
        type: 'float',
        inputs: [
                { name: 'a', type: 'vec2' },
                { name: 'b', type: 'vec2' },
        ],
})

export const distManhattan3 = Fn(([a, b]: [Vec3, Vec3]): Float => {
        return abs(a.x.sub(b.x))
                .add(abs(a.y.sub(b.y)))
                .add(abs(a.z.sub(b.z)))
}).setLayout({
        name: 'distManhattan',
        type: 'float',
        inputs: [
                { name: 'a', type: 'vec3' },
                { name: 'b', type: 'vec3' },
        ],
})

export const distManhattan4 = Fn(([a, b]: [Vec4, Vec4]): Float => {
        return abs(a.x.sub(b.x))
                .add(abs(a.y.sub(b.y)))
                .add(abs(a.z.sub(b.z)))
                .add(abs(a.w.sub(b.w)))
}).setLayout({
        name: 'distManhattan',
        type: 'float',
        inputs: [
                { name: 'a', type: 'vec4' },
                { name: 'b', type: 'vec4' },
        ],
})

export const distChebychev = Fn(([a, b]: [Vec2, Vec2]): Float => {
        return max(abs(a.x.sub(b.x)), abs(a.y.sub(b.y)))
}).setLayout({
        name: 'distChebychev',
        type: 'float',
        inputs: [
                { name: 'a', type: 'vec2' },
                { name: 'b', type: 'vec2' },
        ],
})

export const distChebychev3 = Fn(([a, b]: [Vec3, Vec3]): Float => {
        return max(abs(a.x.sub(b.x)), max(abs(a.y.sub(b.y)), abs(a.z.sub(b.z))))
}).setLayout({
        name: 'distChebychev',
        type: 'float',
        inputs: [
                { name: 'a', type: 'vec3' },
                { name: 'b', type: 'vec3' },
        ],
})

export const distChebychev4 = Fn(([a, b]: [Vec4, Vec4]): Float => {
        return max(abs(a.x.sub(b.x)), max(abs(a.y.sub(b.y)), max(abs(a.z.sub(b.z)), abs(a.w.sub(b.w)))))
}).setLayout({
        name: 'distChebychev',
        type: 'float',
        inputs: [
                { name: 'a', type: 'vec4' },
                { name: 'b', type: 'vec4' },
        ],
})

export const distMinkowski = Fn(([a, b]: [Vec2, Vec2]): Float => {
        const p = DIST_MINKOWSKI_P
        return pow(pow(abs(a.x.sub(b.x)), p).add(pow(abs(a.y.sub(b.y)), p)), 1 / p)
}).setLayout({
        name: 'distMinkowski',
        type: 'float',
        inputs: [
                { name: 'a', type: 'vec2' },
                { name: 'b', type: 'vec2' },
        ],
})

export const distMinkowski3 = Fn(([a, b]: [Vec3, Vec3]): Float => {
        const p = DIST_MINKOWSKI_P
        return pow(
                pow(abs(a.x.sub(b.x)), p)
                        .add(pow(abs(a.y.sub(b.y)), p))
                        .add(pow(abs(a.z.sub(b.z)), p)),
                1 / p
        )
}).setLayout({
        name: 'distMinkowski',
        type: 'float',
        inputs: [
                { name: 'a', type: 'vec3' },
                { name: 'b', type: 'vec3' },
        ],
})

export const distMinkowski4 = Fn(([a, b]: [Vec4, Vec4]): Float => {
        const p = DIST_MINKOWSKI_P
        return pow(
                pow(abs(a.x.sub(b.x)), p)
                        .add(pow(abs(a.y.sub(b.y)), p))
                        .add(pow(abs(a.z.sub(b.z)), p))
                        .add(pow(abs(a.w.sub(b.w)), p)),
                1 / p
        )
}).setLayout({
        name: 'distMinkowski',
        type: 'float',
        inputs: [
                { name: 'a', type: 'vec4' },
                { name: 'b', type: 'vec4' },
        ],
})

export const dist = Fn(([a, b]: [Vec2 | Vec3 | Vec4, Vec2 | Vec3 | Vec4]): Float => {
        return distEuclidean(a, b)
}).setLayout({
        name: 'dist',
        type: 'float',
        inputs: [
                { name: 'a', type: 'auto' },
                { name: 'b', type: 'auto' },
        ],
})
