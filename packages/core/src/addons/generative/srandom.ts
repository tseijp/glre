import { Fn, Float, Vec2, Vec3, Vec4, vec2, vec3, vec4, float, dot, fract, sin, mod } from '../../node'

export const srandom = Fn(([x]: [Float]): Float => {
        return float(-1).add(float(2).mul(x.sin().mul(43758.5453).fract()))
}).setLayout({
        name: 'srandom',
        type: 'float',
        inputs: [{ name: 'x', type: 'float' }],
})

export const srandomVec2 = Fn(([st]: [Vec2]): Float => {
        return float(-1).add(float(2).mul(st.dot(vec2(12.9898, 78.233)).sin().mul(43758.5453).fract()))
}).setLayout({
        name: 'srandomVec2',
        type: 'float',
        inputs: [{ name: 'st', type: 'vec2' }],
})

export const srandomVec3 = Fn(([pos]: [Vec3]): Float => {
        return float(-1).add(float(2).mul(pos.dot(vec3(70.9898, 78.233, 32.4355)).sin().mul(43758.5453123).fract()))
}).setLayout({
        name: 'srandomVec3',
        type: 'float',
        inputs: [{ name: 'pos', type: 'vec3' }],
})

export const srandomVec4 = Fn(([pos]: [Vec4]): Float => {
        const dot_product = pos.dot(vec4(12.9898, 78.233, 45.164, 94.673)).toVar('dot_product')
        return float(-1).add(float(2).mul(dot_product.sin().mul(43758.5453).fract()))
}).setLayout({
        name: 'srandomVec4',
        type: 'float',
        inputs: [{ name: 'pos', type: 'vec4' }],
})

export const srandom2Vec2 = Fn(([st]: [Vec2]): Vec2 => {
        const k = vec2(0.3183099, 0.3678794).toVar('k')
        st.assign(st.mul(k).add(k.yx))
        return vec2(-1).add(
                vec2(2).mul(
                        fract(
                                float(16)
                                        .mul(k)
                                        .mul(st.x.mul(st.y).mul(st.x.add(st.y)).fract())
                        )
                )
        )
}).setLayout({
        name: 'srandom2Vec2',
        type: 'vec2',
        inputs: [{ name: 'st', type: 'vec2' }],
})

export const srandom3Vec3 = Fn(([p]: [Vec3]): Vec3 => {
        p.assign(
                vec3(
                        p.dot(vec3(127.1, 311.7, 74.7)),
                        p.dot(vec3(269.5, 183.3, 246.1)),
                        p.dot(vec3(113.5, 271.9, 124.6))
                )
        )
        return float(-1).add(float(2).mul(p.sin().mul(43758.5453123).fract()))
}).setLayout({
        name: 'srandom3Vec3',
        type: 'vec3',
        inputs: [{ name: 'p', type: 'vec3' }],
})

export const srandom2Vec2Tiled = Fn(([p, tileLength]: [Vec2, Float]): Vec2 => {
        p.assign(mod(p, vec2(tileLength)))
        return srandom2Vec2(p)
}).setLayout({
        name: 'srandom2Vec2Tiled',
        type: 'vec2',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 'tileLength', type: 'float' },
        ],
})

export const srandom3Vec3Tiled = Fn(([p, tileLength]: [Vec3, Float]): Vec3 => {
        p.assign(mod(p, vec3(tileLength)))
        return srandom3Vec3(p)
}).setLayout({
        name: 'srandom3Vec3Tiled',
        type: 'vec3',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'tileLength', type: 'float' },
        ],
})
