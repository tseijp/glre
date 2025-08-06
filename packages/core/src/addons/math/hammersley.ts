import { Fn, UInt, Int, Vec2, Vec3, float, vec2, vec3, uint } from '../../node'

const PI = 3.1415926535897932384626433832795

export const hammersley = Fn(([index, numSamples]: [UInt, Int]): Vec2 => {
        const tof = float(0.5).div(float(0x80000000)).toVar('tof')
        const bits = index.toVar('bits')
        
        bits.assign(bits.shiftLeft(uint(16)).bitOr(bits.shiftRight(uint(16))))
        bits.assign(bits.bitAnd(uint(0x55555555)).shiftLeft(uint(1)).bitOr(bits.bitAnd(uint(0xAAAAAAAA)).shiftRight(uint(1))))
        bits.assign(bits.bitAnd(uint(0x33333333)).shiftLeft(uint(2)).bitOr(bits.bitAnd(uint(0xCCCCCCCC)).shiftRight(uint(2))))
        bits.assign(bits.bitAnd(uint(0x0F0F0F0F)).shiftLeft(uint(4)).bitOr(bits.bitAnd(uint(0xF0F0F0F0)).shiftRight(uint(4))))
        bits.assign(bits.bitAnd(uint(0x00FF00FF)).shiftLeft(uint(8)).bitOr(bits.bitAnd(uint(0xFF00FF00)).shiftRight(uint(8))))
        
        return vec2(
                float(index).div(float(numSamples)),
                float(bits).mul(tof)
        )
}).setLayout({
        name: 'hammersley',
        type: 'vec2',
        inputs: [
                { name: 'index', type: 'uint' },
                { name: 'numSamples', type: 'int' }
        ]
})

export const hemisphereCosSample = Fn(([u]: [Vec2]): Vec3 => {
        const phi = float(2.0).mul(PI).mul(u.x).toVar('phi')
        const cosTheta2 = float(1.0).sub(u.y).toVar('cosTheta2')
        const cosTheta = cosTheta2.sqrt().toVar('cosTheta')
        const sinTheta = float(1.0).sub(cosTheta2).sqrt().toVar('sinTheta')
        
        return vec3(
                phi.cos().mul(sinTheta),
                phi.sin().mul(sinTheta),
                cosTheta
        )
}).setLayout({
        name: 'hemisphereCosSample',
        type: 'vec3',
        inputs: [
                { name: 'u', type: 'vec2' }
        ]
})