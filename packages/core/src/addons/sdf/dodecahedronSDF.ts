import { Fn, Vec3, Float, vec3, float } from '../../node'

const PHI = 1.618033988749894848204586834

export const dodecahedronSDF = Fn(([p]: [Vec3]): Float => {
        const n = vec3(PHI, 1, 0).normalize().toVar('n')
        const pAbs = p.abs().toVar('pAbs')
        const a = pAbs.dot(vec3(n.x, n.y, n.z)).toVar('a')
        const b = pAbs.dot(vec3(n.z, n.x, n.y)).toVar('b')
        const c = pAbs.dot(vec3(n.y, n.z, n.x)).toVar('c')
        return a.max(b).max(c).sub(n.x)
}).setLayout({
        name: 'dodecahedronSDF',
        type: 'float',
        inputs: [{ name: 'p', type: 'vec3' }],
})

export const dodecahedronSDFRadius = Fn(([p, radius]: [Vec3, Float]): Float => {
        const n = vec3(PHI, 1, 0).normalize().toVar('n')
        const pScaled = p.abs().div(radius).toVar('pScaled')
        const a = pScaled.dot(vec3(n.x, n.y, n.z)).toVar('a')
        const b = pScaled.dot(vec3(n.z, n.x, n.y)).toVar('b')
        const c = pScaled.dot(vec3(n.y, n.z, n.x)).toVar('c')
        return a.max(b).max(c).sub(n.x).mul(radius)
}).setLayout({
        name: 'dodecahedronSDFRadius',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'radius', type: 'float' },
        ],
})
