import { Fn, Vec3, Float } from '../../node'

export const sphereSDF = Fn(([p]: [Vec3]) => {
        return p.length()
}).setLayout({
        name: 'sphereSDF',
        type: 'float',
        inputs: [{ name: 'p', type: 'vec3' }],
})

export const sphereSDFRadius = Fn(([p, s]: [Vec3, Float]) => {
        return p.length().sub(s)
}).setLayout({
        name: 'sphereSDFRadius',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 's', type: 'float' },
        ],
})
