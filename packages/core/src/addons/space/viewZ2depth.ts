import { Fn, Float } from '../../node'

export const viewZ2depth = Fn(([viewZ, near, far]: [Float, Float, Float]): Float => {
        return viewZ.add(near).mul(far).div(far.sub(near).mul(viewZ))
}).setLayout({
        name: 'viewZ2depth',
        type: 'float',
        inputs: [
                { name: 'viewZ', type: 'float' },
                { name: 'near', type: 'float' },
                { name: 'far', type: 'float' },
        ],
})

export const viewZ2depthOrthographic = Fn(([viewZ, near, far]: [Float, Float, Float]): Float => {
        return viewZ.add(near).div(near.sub(far))
}).setLayout({
        name: 'viewZ2depthOrthographic',
        type: 'float',
        inputs: [
                { name: 'viewZ', type: 'float' },
                { name: 'near', type: 'float' },
                { name: 'far', type: 'float' },
        ],
})
