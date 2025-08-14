import { Fn, Float, select } from '../../node'

// Perspective projection version
export const depth2viewZ = Fn(([depth, near, far]: [Float, Float, Float]): Float => {
        return near.mul(far).div(far.sub(near).mul(depth).sub(far))
}).setLayout({
        name: 'depth2viewZ',
        type: 'float',
        inputs: [
                { name: 'depth', type: 'float' },
                { name: 'near', type: 'float' },
                { name: 'far', type: 'float' },
        ],
})

// Orthographic projection version
export const depth2viewZOrthographic = Fn(([depth, near, far]: [Float, Float, Float]): Float => {
        return depth.mul(near.sub(far)).sub(near)
}).setLayout({
        name: 'depth2viewZOrthographic',
        type: 'float',
        inputs: [
                { name: 'depth', type: 'float' },
                { name: 'near', type: 'float' },
                { name: 'far', type: 'float' },
        ],
})

// Combined version with orthographic flag
export const depth2viewZCombined = Fn(([depth, near, far, orthographic]: [Float, Float, Float, Float]): Float => {
        const perspective = near.mul(far).div(far.sub(near).mul(depth).sub(far))
        const ortho = depth.mul(near.sub(far)).sub(near)
        return select(ortho, perspective, orthographic.greaterThan(0.5))
}).setLayout({
        name: 'depth2viewZCombined',
        type: 'float',
        inputs: [
                { name: 'depth', type: 'float' },
                { name: 'near', type: 'float' },
                { name: 'far', type: 'float' },
                { name: 'orthographic', type: 'float' },
        ],
})
