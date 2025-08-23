import { Fn, Vec3, Float } from '../../node'

export const planeSDF = Fn(([p]: [Vec3]): Float => {
        return p.y
}).setLayout({
        name: 'planeSDF',
        type: 'float',
        inputs: [{ name: 'p', type: 'vec3' }],
})

export const planeSDFNormal = Fn(([p, planePoint, planeNormal]: [Vec3, Vec3, Vec3]): Float => {
        return planeNormal.dot(p).add(planeNormal.dot(planePoint)).div(planeNormal.length())
}).setLayout({
        name: 'planeSDFNormal',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'planePoint', type: 'vec3' },
                { name: 'planeNormal', type: 'vec3' },
        ],
})
