import { Fn, Vec3, Float } from '../../node'

export const octahedronSDF = Fn(([p, s]: [Vec3, Float]): Float => {
        const pAbs = p.abs().toVar('pAbs')
        const m = pAbs.x.add(pAbs.y).add(pAbs.z).sub(s).toVar('m')
        return m.mul(0.57735027)
}).setLayout({
        name: 'octahedronSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 's', type: 'float' },
        ],
})

export const octahedronSDFExact = Fn(([p, s]: [Vec3, Float]): Float => {
        const pAbs = p.abs().toVar('pAbs')
        const m = pAbs.x.add(pAbs.y).add(pAbs.z).sub(s).toVar('m')
        const o = pAbs.mul(3).sub(m).min(0).toVar('o')
        o.assign(pAbs.mul(6).sub(m.mul(2)).sub(o.mul(3)).add(o.x.add(o.y).add(o.z)).max(0))
        const oSum = o.x.add(o.y).add(o.z).toVar('oSum')
        return pAbs.sub(s.mul(o).div(oSum)).length()
}).setLayout({
        name: 'octahedronSDFExact',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 's', type: 'float' },
        ],
})
