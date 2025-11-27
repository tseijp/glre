import { Fn, Vec2, Float, vec3, float } from '../../node'
import { PI } from '../math/const'

export const gerstnerWave = Fn(([_uv, _dir, _steepness, _wavelength, _time]: [Vec2, Vec2, Float, Float, Float]) => {
        const k = PI.mul(2).div(_wavelength).toVar('k')
        const c = float(9.8).div(k).sqrt().toVar('c')
        const d = _dir.normalize().toVar('d')
        const f = k.mul(_uv.dot(d).sub(c.mul(_time))).toVar('f')
        const a = _steepness.div(k).toVar('a')
        return vec3(d.x.mul(a.mul(f.cos())), a.mul(f.sin()), d.y.mul(a.mul(f.cos())))
}).setLayout({
        name: 'gerstnerWave',
        type: 'vec3',
        inputs: [
                { name: '_uv', type: 'vec2' },
                { name: '_dir', type: 'vec2' },
                { name: '_steepness', type: 'float' },
                { name: '_wavelength', type: 'float' },
                { name: '_time', type: 'float' },
        ],
})
