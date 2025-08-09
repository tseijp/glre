import { Fn, Float, Vec2, Vec3, float, Loop } from '../../node'
import { snoiseVec2, snoiseVec3 } from './snoise'
import { gnoiseVec3Tiled } from './gnoise'

const FBM_OCTAVES = 4
const FBM_SCALE_SCALAR = 2.0
const FBM_AMPLITUDE_INITIAL = 0.5
const FBM_AMPLITUDE_SCALAR = 0.5

export const fbmVec2 = Fn(([st]: [Vec2]): Float => {
        const value = float(0).toVar('value')
        const amplitude = float(FBM_AMPLITUDE_INITIAL).toVar('amplitude')
        const stVar = st.toVar('st')
        Loop(FBM_OCTAVES, () => {
                value.addAssign(amplitude.mul(snoiseVec2(stVar)))
                stVar.mulAssign(FBM_SCALE_SCALAR)
                amplitude.mulAssign(FBM_AMPLITUDE_SCALAR)
        })
        return value
}).setLayout({
        name: 'fbmVec2',
        type: 'float',
        inputs: [{ name: 'st', type: 'vec2' }],
})

export const fbmVec3 = Fn(([pos]: [Vec3]): Float => {
        const value = float(0).toVar('value')
        const amplitude = float(FBM_AMPLITUDE_INITIAL).toVar('amplitude')
        const posVar = pos.toVar('pos')
        Loop(FBM_OCTAVES, () => {
                value.addAssign(amplitude.mul(snoiseVec3(posVar)))
                posVar.mulAssign(FBM_SCALE_SCALAR)
                amplitude.mulAssign(FBM_AMPLITUDE_SCALAR)
        })
        return value
}).setLayout({
        name: 'fbmVec3',
        type: 'float',
        inputs: [{ name: 'pos', type: 'vec3' }],
})

export const fbmVec3Tiled = Fn(([p, tileLength]: [Vec3, Float]): Float => {
        const persistence = float(0.5).toVar('persistence')
        const lacunarity = float(2).toVar('lacunarity')
        const amplitude = float(0.5).toVar('amplitude')
        const total = float(0).toVar('total')
        const normalization = float(0).toVar('normalization')
        const pVar = p.toVar('p')
        Loop(FBM_OCTAVES, () => {
                const noiseValue = gnoiseVec3Tiled(pVar, tileLength.mul(lacunarity).mul(0.5))
                        .mul(0.5)
                        .add(0.5)
                        .toVar('noiseValue')
                total.addAssign(noiseValue.mul(amplitude))
                normalization.addAssign(amplitude)
                amplitude.mulAssign(persistence)
                pVar.assign(pVar.mul(lacunarity))
        })
        return total.div(normalization)
}).setLayout({
        name: 'fbmVec3Tiled',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'tileLength', type: 'float' },
        ],
})
