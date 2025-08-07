import { Fn, Float, Vec3, Vec4, dot, vec3, vec4, float } from '../../node'

const UnpackDownscale = float(255.0 / 256.0)
const PackFactors = vec3(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0)
const UnpackFactors = UnpackDownscale.div(vec4(PackFactors, 1.0))

export const unpack8 = Fn(([v]: [Vec3]): Float => {
        const f = vec3(8.0, 8.0 * 8.0, 8.0 * 8.0 * 8.0)
        return dot(v, f).div(512.0)
}).setLayout({
        name: 'unpack8',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec3' }],
})

export const unpack16 = Fn(([v]: [Vec3]): Float => {
        const f = vec3(16.0, 16.0 * 16.0, 16.0 * 16.0 * 16.0)
        return dot(v, f).div(4096.0)
}).setLayout({
        name: 'unpack16',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec3' }],
})

export const unpack32 = Fn(([v]: [Vec3]): Float => {
        const f = vec3(32.0, 32.0 * 32.0, 32.0 * 32.0 * 32.0)
        return dot(v, f).div(32768.0)
}).setLayout({
        name: 'unpack32',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec3' }],
})

export const unpack64 = Fn(([v]: [Vec3]): Float => {
        const f = vec3(64.0, 64.0 * 64.0, 64.0 * 64.0 * 64.0)
        return dot(v, f).div(262144.0)
}).setLayout({
        name: 'unpack64',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec3' }],
})

export const unpack128 = Fn(([v]: [Vec3]): Float => {
        const f = vec3(128.0, 128.0 * 128.0, 128.0 * 128.0 * 128.0)
        return dot(v, f).div(2097152.0)
}).setLayout({
        name: 'unpack128',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec3' }],
})

export const unpack256 = Fn(([v]: [Vec3]): Float => {
        const f = vec3(256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0)
        return dot(v, f).div(16581375.0)
}).setLayout({
        name: 'unpack256',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec3' }],
})

export const unpackBase = Fn(([v, base]: [Vec3, Float]): Float => {
        const base3 = base.mul(base).mul(base)
        const f = vec3(base, base.mul(base), base3)
        return dot(v, f).div(base3)
}).setLayout({
        name: 'unpackBase',
        type: 'float',
        inputs: [
                { name: 'v', type: 'vec3' },
                { name: 'base', type: 'float' },
        ],
})

export const unpack = Fn(([v]: [Vec4]): Float => {
        return dot(v, UnpackFactors)
}).setLayout({
        name: 'unpack',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec4' }],
})

export const unpackDefault = Fn(([v]: [Vec3]): Float => {
        return unpack256(v)
}).setLayout({
        name: 'unpackDefault',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec3' }],
})
