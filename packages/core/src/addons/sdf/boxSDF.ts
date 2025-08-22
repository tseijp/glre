import { Fn, Vec3 } from '../../node'

export const boxSDF = Fn(([p]: [Vec3]) => {
        const d = p.abs().toVar()
        return d.x.max(d.y.max(d.z)).min(0).add(d.max(0).length())
}).setLayout({
        name: 'boxSDF',
        type: 'float',
        inputs: [{ name: 'p', type: 'vec3' }],
})

export const boxSDFSize = Fn(([p, b]: [Vec3, Vec3]) => {
        const d = p.abs().sub(b).toVar()
        return d.x.max(d.y.max(d.z)).min(0).add(d.max(0).length())
}).setLayout({
        name: 'boxSDFSize',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'b', type: 'vec3' },
        ],
})
