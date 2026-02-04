import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { iDrag, instance, varying, vec3, vec4 } from 'glre/src/node'
import { box, sphere } from 'glre/src/buffers'
import { rotate3dX, rotate3dY } from 'glre/src/addons'

export default function WebGLInstancing() {
        const instanceCount = 200
        const mat = rotate3dX(iDrag.y).mul(rotate3dY(iDrag.x))
        const rand = (a = -1, b = 1) => (b - a) * Math.random() + a
        const geo1 = box({ width: 0.1, height: 0.1, depth: 0.1 })
        const pos1 = instance(vec3(), 'pos1')
        const geo2 = sphere({ radius: 0.1 })
        const pos2 = instance(vec3(), 'pos2')

        const gl = useGL(
                {
                        isWebGL: true,
                        isDepth: true,
                        count: geo1.count,
                        instanceCount,
                        vertex: vec4(mat.mul(geo1.vertex('boxVertex').add(pos1)), 1),
                        fragment: vec4(varying(geo1.normal('boxNormal')), 1),
                        instances: { pos1: null },
                        attributes: { boxVertex: null, boxNormal: null },
                        mount() {
                                const pos = []
                                for (let i = 0; i < instanceCount; i++) pos.push(rand(), rand(), rand(0, -1))
                                pos1.value = pos
                        },
                },
                {
                        count: geo2.count,
                        instanceCount,
                        vertex: vec4(mat.mul(geo2.vertex('sphereVertex').add(pos1)), 1),
                        fragment: vec4(varying(geo2.normal('sphereNormal')), 1),
                        instances: { pos2: null },
                        attributes: { sphereVertex: null, sphereNormal: null },
                        mount() {
                                const pos = []
                                for (let i = 0; i < instanceCount; i++) pos.push(rand(), rand(), rand(0, -1))
                                pos2.value = pos
                        },
                }
        )

        return (
                <Layout noFooter>
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', touchAction: 'none' }}>
                                <canvas ref={gl.ref} />
                        </div>
                </Layout>
        )
}
