import { PI } from './const'
import { Fn, Int, Vec2, Vec3, float, vec2, vec3, uint } from '../../node'

export const hammersley = Fn(([index, numSamples]: [Int, Int]): Vec2 => {
        const tof = float(0.5).div(float(2147483648)).toVar('tof')
        const bits = uint(index).toVar('bits')

        bits.assign(bits.shiftLeft(uint(16)).bitOr(bits.shiftRight(uint(16))))
        bits.assign(
                bits
                        .bitAnd(uint(0x55555555))
                        .shiftLeft(uint(1))
                        .bitOr(bits.bitAnd(uint(0xaaaaaaaa)).shiftRight(uint(1)))
        )
        bits.assign(
                bits
                        .bitAnd(uint(0x33333333))
                        .shiftLeft(uint(2))
                        .bitOr(bits.bitAnd(uint(0xcccccccc)).shiftRight(uint(2)))
        )
        bits.assign(
                bits
                        .bitAnd(uint(0x0f0f0f0f))
                        .shiftLeft(uint(4))
                        .bitOr(bits.bitAnd(uint(0xf0f0f0f0)).shiftRight(uint(4)))
        )
        bits.assign(
                bits
                        .bitAnd(uint(0x00ff00ff))
                        .shiftLeft(uint(8))
                        .bitOr(bits.bitAnd(uint(0xff00ff00)).shiftRight(uint(8)))
        )

        return vec2(float(index).div(float(numSamples)), float(bits).mul(tof))
}).setLayout({
        name: 'hammersley',
        type: 'vec2',
        inputs: [
                { name: 'index', type: 'int' },
                { name: 'numSamples', type: 'int' },
        ],
})

export const hemisphereCosSample = Fn(([u]: [Vec2]): Vec3 => {
        const phi = float(2.0).mul(PI).mul(u.x).toVar('phi')
        const cosTheta2 = float(1.0).sub(u.y).toVar('cosTheta2')
        const cosTheta = cosTheta2.sqrt().toVar('cosTheta')
        const sinTheta = float(1.0).sub(cosTheta2).sqrt().toVar('sinTheta')

        return vec3(phi.cos().mul(sinTheta), phi.sin().mul(sinTheta), cosTheta)
}).setLayout({
        name: 'hemisphereCosSample',
        type: 'vec3',
        inputs: [{ name: 'u', type: 'vec2' }],
})
