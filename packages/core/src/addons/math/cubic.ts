import { Fn, Float, Vec2, Vec3, Vec4, X } from '../../node'

export const cubicFloat = Fn(([v]: [Float]): Float => {
        return v.mul(v).mul(v.mul(-2).add(3))
}).setLayout({
        name: 'cubicFloat',
        type: 'float',
        inputs: [{ name: 'v', type: 'float' }],
})

export const cubicVec2 = Fn(([v]: [Vec2]): Vec2 => {
        return v.mul(v).mul(v.mul(-2).add(3))
}).setLayout({
        name: 'cubicVec2',
        type: 'vec2',
        inputs: [{ name: 'v', type: 'vec2' }],
})

export const cubicVec3 = Fn(([v]: [Vec3]): Vec3 => {
        return v.mul(v).mul(v.mul(-2).add(3))
}).setLayout({
        name: 'cubicVec3',
        type: 'vec3',
        inputs: [{ name: 'v', type: 'vec3' }],
})

export const cubicVec4 = Fn(([v]: [Vec4]): Vec4 => {
        return v.mul(v).mul(v.mul(-2).add(3))
}).setLayout({
        name: 'cubicVec4',
        type: 'vec4',
        inputs: [{ name: 'v', type: 'vec4' }],
})

export const cubicFloatSlopes = Fn(([v, slope0, slope1]: [Float, Float, Float]): Float => {
        const a = slope0.add(slope1).sub(2).toVar('a')
        const b = slope0.mul(-2).sub(slope1).add(3).toVar('b')
        const c = slope0.toVar('c')
        const v2 = v.mul(v).toVar('v2')
        const v3 = v.mul(v2).toVar('v3')
        return a.mul(v3).add(b.mul(v2)).add(c.mul(v))
}).setLayout({
        name: 'cubicFloatSlopes',
        type: 'float',
        inputs: [
                { name: 'v', type: 'float' },
                { name: 'slope0', type: 'float' },
                { name: 'slope1', type: 'float' },
        ],
})

export const cubicVec2Slopes = Fn(([v, slope0, slope1]: [Vec2, Float, Float]): Vec2 => {
        const a = slope0.add(slope1).sub(2).toVar('a')
        const b = slope0.mul(-2).sub(slope1).add(3).toVar('b')
        const c = slope0.toVar('c')
        const v2 = v.mul(v).toVar('v2')
        const v3 = v.mul(v2).toVar('v3')
        return a.mul(v3).add(b.mul(v2)).add(c.mul(v))
}).setLayout({
        name: 'cubicVec2Slopes',
        type: 'vec2',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 'slope0', type: 'float' },
                { name: 'slope1', type: 'float' },
        ],
})

export const cubicVec3Slopes = Fn(([v, slope0, slope1]: [Vec3, Float, Float]): Vec3 => {
        const a = slope0.add(slope1).sub(2).toVar('a')
        const b = slope0.mul(-2).sub(slope1).add(3).toVar('b')
        const c = slope0.toVar('c')
        const v2 = v.mul(v).toVar('v2')
        const v3 = v.mul(v2).toVar('v3')
        return a.mul(v3).add(b.mul(v2)).add(c.mul(v))
}).setLayout({
        name: 'cubicVec3Slopes',
        type: 'vec3',
        inputs: [
                { name: 'v', type: 'vec3' },
                { name: 'slope0', type: 'float' },
                { name: 'slope1', type: 'float' },
        ],
})

export const cubicVec4Slopes = Fn(([v, slope0, slope1]: [Vec4, Float, Float]): Vec4 => {
        const a = slope0.add(slope1).sub(2).toVar('a')
        const b = slope0.mul(-2).sub(slope1).add(3).toVar('b')
        const c = slope0.toVar('c')
        const v2 = v.mul(v).toVar('v2')
        const v3 = v.mul(v2).toVar('v3')
        return a.mul(v3).add(b.mul(v2)).add(c.mul(v))
}).setLayout({
        name: 'cubicVec4Slopes',
        type: 'vec4',
        inputs: [
                { name: 'v', type: 'vec4' },
                { name: 'slope0', type: 'float' },
                { name: 'slope1', type: 'float' },
        ],
})

// Legacy function for backward compatibility
export const cubic = Fn((args: [X] | [X, X, X]): X => {
        const [v, slope0, slope1] = args
        if (!slope0 || !slope1) return v.mul(v).mul(v.mul(-2).add(3))
        const a = slope0.add(slope1).sub(2).toVar('a')
        const b = slope0.mul(-2).sub(slope1).add(3).toVar('b')
        const c = slope0.toVar('c')
        const v2 = v.mul(v).toVar('v2')
        const v3 = v.mul(v2).toVar('v3')
        return a.mul(v3).add(b.mul(v2)).add(c.mul(v))
}).setLayout({
        name: 'cubic',
        type: 'auto',
        inputs: [
                { name: 'v', type: 'auto' },
                { name: 'slope0', type: 'float' },
                { name: 'slope1', type: 'float' },
        ],
})