import { float, Fn, id, If, int, Loop, storage, uv, UVec3, Vec2, vec2, vec3, vec4 } from 'glre/src/node'
import { useGL } from 'glre/src/react'

const particles = 1024

export default function GPGPUParticlesApp() {
        const positions = storage(vec2(), 'positions')
        const velocities = storage(vec2(), 'velocities')

        const compute = Fn(([id]: [UVec3]) => {
                const index = id.x
                const pos = positions.element(index).toVar('pos')
                const vel = velocities.element(index).toVar('vel')
                pos.assign(pos.add(vel.mul(0.01)))
                const isReverseX = pos.x.lessThan(0.0).or(pos.x.greaterThan(1.0))
                const isReverseY = pos.y.lessThan(0.0).or(pos.y.greaterThan(1.0))
                If(isReverseX, () => {
                        vel.x.assign(vel.x.mul(-1.0))
                        pos.x.assign(pos.x.clamp(0.0, 1.0))
                })
                If(isReverseY, () => {
                        vel.y.assign(vel.y.mul(-1.0))
                        pos.y.assign(pos.y.clamp(0.0, 1.0))
                })
                positions.element(index).assign(pos)
                velocities.element(index).assign(vel)
        })

        const fragment = Fn(([uv]: [Vec2]) => {
                const intensity = float(0.0).toVar('intensity')
                Loop(int(1024), ({ i }) => {
                        const pos = positions.element(i).toVar('pos')
                        const dist = uv.distance(pos as any).toVar('dist')
                        intensity.assign(intensity.add(float(1.0).div(dist).div(float(1024))))
                })
                const color = vec3(0.3, 0.2, 0.2).mul(intensity)
                return vec4(color, 1.0)
        })

        const gl = useGL({
                particles,
                isWebGL: false,
                cs: compute(id),
                fs: fragment(uv),
                mount() {
                        const positions = [] as number[]
                        const velocities = [] as number[]

                        for (let i = 0; i < particles; i++) {
                                positions[i * 2] = Math.random()
                                positions[i * 2 + 1] = Math.random()
                                velocities[i * 2] = (Math.random() - 0.5) * 0.5
                                velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.5
                        }

                        gl.storage('positions', positions)
                        gl.storage('velocities', velocities)
                },
        })

        return <canvas ref={gl.ref} />
}
