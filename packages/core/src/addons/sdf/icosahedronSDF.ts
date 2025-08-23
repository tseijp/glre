import { Fn, Vec3, Float, vec3 } from '../../node'

export const icosahedronSDF = Fn(([p, radius]: [Vec3, Float]): Float => {
        const phi = 2.61803398875 // Golden ratio constant (φ + 1)
        const n1 = vec3(phi, 1, 0).normalize().toVar('n1')
        const n2 = vec3(0.57735026919).toVar('n2') // 1/sqrt(3)

        const normalizedP = p.abs().div(radius).toVar('normalizedP')

        const a = normalizedP.dot(n1).toVar('a')
        const b = normalizedP.dot(vec3(n1.z, n1.x, n1.y)).toVar('b')
        const c = normalizedP.dot(vec3(n1.y, n1.z, n1.x)).toVar('c')
        const d = normalizedP.dot(n2).sub(n1.x).toVar('d')

        return a.max(b).max(c).sub(n1.x).max(d).mul(radius)
}).setLayout({
        name: 'icosahedronSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'radius', type: 'float' },
        ],
})
